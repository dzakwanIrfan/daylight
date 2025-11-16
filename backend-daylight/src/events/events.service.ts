import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EventStatus, PaymentStatus } from '@prisma/client';
import { QueryEventsDto, SortOrder } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BulkActionEventDto, EventBulkActionType } from './dto/bulk-action-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique slug from title
   */
  private async generateSlug(title: string, excludeId?: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let counter = 0;
    let uniqueSlug = slug;

    while (true) {
      const existing = await this.prisma.event.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }

      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  }

  /**
   * Check if user has already purchased this event
   * Returns: null (never purchased) | PAID | PENDING | FAILED | EXPIRED | REFUNDED
   */
  async checkUserPurchaseStatus(slug: string, userId: string) {
    // First, get the event by slug
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Find user's transaction for this event
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        eventId: event.id,
      },
      orderBy: {
        createdAt: 'desc', // Get latest transaction
      },
      select: {
        id: true,
        paymentStatus: true,
        merchantRef: true,
        paidAt: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      return {
        hasPurchased: false,
        canPurchase: true,
        status: null,
        transaction: null,
      };
    }

    // Determine if user can purchase again
    const canPurchaseAgain = new Set<PaymentStatus>([
      PaymentStatus.FAILED,
      PaymentStatus.EXPIRED,
      PaymentStatus.REFUNDED,
    ]).has(transaction.paymentStatus);

    return {
      hasPurchased: true,
      canPurchase: canPurchaseAgain,
      status: transaction.paymentStatus,
      transaction: {
        id: transaction.id,
        merchantRef: transaction.merchantRef,
        paidAt: transaction.paidAt,
        createdAt: transaction.createdAt,
      },
    };
  }

  /**
   * Get events with filtering, sorting, and pagination
   */
  async getEvents(queryDto: QueryEventsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'eventDate',
      sortOrder = SortOrder.DESC,
      category,
      status,
      isActive,
      isFeatured,
      city,
      dateFrom,
      dateTo,
    } = queryDto;

    const where: Prisma.EventWhereInput = {};

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { organizerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (category) where.category = category;
    if (status) where.status = status;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    // Date range
    if (dateFrom || dateTo) {
      where.eventDate = {};
      if (dateFrom) where.eventDate.gte = new Date(dateFrom);
      if (dateTo) where.eventDate.lte = new Date(dateTo);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Execute queries
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.event.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: events,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        category,
        status,
        isActive,
        isFeatured,
        city,
        dateFrom,
        dateTo,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Get events for next week
   */
  async getNextWeekEvents() {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7); // 7 days from now
    nextWeek.setHours(23, 59, 59, 999); // End of that day

    const events = await this.prisma.event.findMany({
      where: {
        eventDate: {
          gte: now,
          lte: nextWeek,
        },
        status: EventStatus.PUBLISHED,
        isActive: true,
      },
      orderBy: {
        eventDate: 'asc',
      },
      take: 10,
    });

    return {
      data: events,
      dateRange: {
        from: now.toISOString(),
        to: nextWeek.toISOString(),
      },
      total: events.length,
    };
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  /**
   * Get event by slug
   */
  async getEventBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  /**
   * Create event
   */
  async createEvent(createEventDto: CreateEventDto) {
    const slug = await this.generateSlug(createEventDto.title);

    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        slug,
        eventDate: new Date(createEventDto.eventDate),
        startTime: new Date(createEventDto.startTime),
        endTime: new Date(createEventDto.endTime),
      },
    });

    return {
      message: 'Event created successfully',
      event,
    };
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    let slug = existingEvent.slug;

    // Regenerate slug if title changed
    if (updateEventDto.title && updateEventDto.title !== existingEvent.title) {
      slug = await this.generateSlug(updateEventDto.title, eventId);
    }

    const updateData: any = {
      ...updateEventDto,
      slug,
    };

    // Convert dates if provided
    if (updateEventDto.eventDate) {
      updateData.eventDate = new Date(updateEventDto.eventDate);
    }
    if (updateEventDto.startTime) {
      updateData.startTime = new Date(updateEventDto.startTime);
    }
    if (updateEventDto.endTime) {
      updateData.endTime = new Date(updateEventDto.endTime);
    }

    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return {
      message: 'Event updated successfully',
      event,
    };
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, hardDelete: boolean = false) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (hardDelete) {
      await this.prisma.event.delete({
        where: { id: eventId },
      });

      return {
        message: 'Event permanently deleted',
      };
    } else {
      await this.prisma.event.update({
        where: { id: eventId },
        data: { isActive: false, status: EventStatus.CANCELLED },
      });

      return {
        message: 'Event deactivated',
      };
    }
  }

  /**
   * Bulk actions
   */
  async bulkAction(bulkActionDto: BulkActionEventDto) {
    const { eventIds, action } = bulkActionDto;

    const events = await this.prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true },
    });

    if (events.length !== eventIds.length) {
      throw new BadRequestException('Some event IDs are invalid');
    }

    let result;

    switch (action) {
      case EventBulkActionType.ACTIVATE:
        result = await this.prisma.event.updateMany({
          where: { id: { in: eventIds } },
          data: { isActive: true },
        });
        break;

      case EventBulkActionType.DEACTIVATE:
        result = await this.prisma.event.updateMany({
          where: { id: { in: eventIds } },
          data: { isActive: false },
        });
        break;

      case EventBulkActionType.DELETE:
        result = await this.prisma.event.deleteMany({
          where: { id: { in: eventIds } },
        });
        break;

      case EventBulkActionType.PUBLISH:
        result = await this.prisma.event.updateMany({
          where: { id: { in: eventIds } },
          data: { status: EventStatus.PUBLISHED, isActive: true },
        });
        break;

      case EventBulkActionType.DRAFT:
        result = await this.prisma.event.updateMany({
          where: { id: { in: eventIds } },
          data: { status: EventStatus.DRAFT },
        });
        break;

      case EventBulkActionType.CANCEL:
        result = await this.prisma.event.updateMany({
          where: { id: { in: eventIds } },
          data: { status: EventStatus.CANCELLED },
        });
        break;

      default:
        throw new BadRequestException('Invalid bulk action');
    }

    return {
      message: `Bulk action ${action} completed successfully`,
      affectedCount: result.count,
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const [
      totalEvents,
      activeEvents,
      upcomingEvents,
      completedEvents,
      eventsByCategory,
      eventsByStatus,
      recentEvents,
    ] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.count({ 
        where: { 
          isActive: true, 
          status: EventStatus.PUBLISHED 
        } 
      }),
      this.prisma.event.count({
        where: {
          eventDate: { gte: now },
          status: EventStatus.PUBLISHED,
          isActive: true,
        },
      }),
      this.prisma.event.count({ 
        where: { status: EventStatus.COMPLETED } 
      }),
      this.prisma.event.groupBy({
        by: ['category'],
        _count: true,
      }),
      this.prisma.event.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.event.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          eventDate: true,
          status: true,
          currentParticipants: true,
          maxParticipants: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      overview: {
        totalEvents,
        activeEvents,
        upcomingEvents,
        completedEvents,
      },
      breakdown: {
        byCategory: eventsByCategory.map((item) => ({
          category: item.category,
          count: item._count,
        })),
        byStatus: eventsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
      },
      recentEvents,
    };
  }

  /**
   * Export events
   */
  async exportEvents(queryDto: QueryEventsDto) {
    const { 
      search, 
      category, 
      status, 
      isActive, 
      isFeatured, 
      city, 
      dateFrom, 
      dateTo 
    } = queryDto;

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    if (dateFrom || dateTo) {
      where.eventDate = {};
      if (dateFrom) where.eventDate.gte = new Date(dateFrom);
      if (dateTo) where.eventDate.lte = new Date(dateTo);
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { eventDate: 'desc' },
    });

    return events;
  }
}