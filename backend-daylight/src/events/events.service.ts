import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EventStatus, PaymentStatus, TransactionType, EventCategory } from '@prisma/client';
import type { User } from '@prisma/client';
import { QueryEventsDto, SortOrder } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BulkActionEventDto, EventBulkActionType } from './dto/bulk-action-event.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { ParticipantSortField, QueryEventParticipantsDto } from './dto/query-event-participants.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) { }

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
   * Validate partner location matches event city
   * Returns partner data if valid
   */
  private async validatePartnerLocation(partnerId: string, eventCityId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        cityRelation: true,
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (!partner.isActive || partner.status !== 'ACTIVE') {
      throw new BadRequestException('Selected partner is not active');
    }

    // VALIDATE: Partner must be in the same city as event
    if (partner.cityId !== eventCityId) {
      throw new ConflictException(
        `Partner location mismatch.  Partner "${partner.name}" is located in ${partner?.cityRelation?.name}, but event is in a different city.`
      );
    }

    return partner;
  }

  /**
   * Auto-fill venue data from partner
   */
  private extractVenueDataFromPartner(partner: any) {
    return {
      venue: partner.name,
      address: partner.address,
      latitude: partner.latitude,
      longitude: partner.longitude,
      googleMapsUrl: partner.googleMapsUrl,
    };
  }

  /**
   * Check if user has purchased a specific event
   */
  private async hasUserPurchasedEvent(userId: string, eventId: string): Promise<boolean> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: PaymentStatus.PAID,
      },
    });

    return !!transaction;
  }

  /**
   * Check if event is within 24 hours before start time
   */
  private isEventWithin24Hours(eventDate: Date, startTime: Date): boolean {
    const now = new Date();
    const eventStartDateTime = new Date(eventDate);

    const startTimeDate = new Date(startTime);
    eventStartDateTime.setHours(startTimeDate.getHours());
    eventStartDateTime.setMinutes(startTimeDate.getMinutes());
    eventStartDateTime.setSeconds(0);
    eventStartDateTime.setMilliseconds(0);

    const twentyFourHoursBefore = new Date(eventStartDateTime);
    twentyFourHoursBefore.setHours(twentyFourHoursBefore.getHours() - 24);

    return now >= twentyFourHoursBefore;
  }

  /**
   * Check if user has already purchased this event
   */
  async checkUserPurchaseStatus(slug: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      select: { id: true, title: true, price: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const hasValidSubscription = await this.subscriptionsService.hasValidSubscription(userId);

    const transaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        eventId: event.id,
        transactionType: TransactionType.EVENT,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      return {
        hasPurchased: false,
        canPurchase: true,
        status: null,
        transaction: null,
        hasSubscription: hasValidSubscription ? true : false,
        subscriptionAccess: hasValidSubscription ? true : false,
      };
    }

    const canPurchaseAgain = new Set<PaymentStatus>([
      PaymentStatus.FAILED,
      PaymentStatus.EXPIRED,
      PaymentStatus.REFUNDED,
    ]).has(transaction.status);

    return {
      hasPurchased: true,
      canPurchase: canPurchaseAgain,
      status: transaction.status,
      transaction: {
        id: transaction.id,
        createdAt: transaction.createdAt,
      },
      hasSubscription: hasValidSubscription ? true : false,
      subscriptionAccess: hasValidSubscription ? true : false,
    };
  }

  /**
   * Create event with partner location validation
   */
  async createEvent(createEventDto: CreateEventDto) {
    // 1. Validate cityId exists
    const city = await this.prisma.city.findUnique({
      where: { id: createEventDto.cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    let venueData: any = {};
    let partnerId = createEventDto.partnerId;

    // 2. If partnerId is provided, validate and auto-fill venue data
    if (partnerId) {
      const partner = await this.validatePartnerLocation(partnerId, createEventDto.cityId);
      venueData = this.extractVenueDataFromPartner(partner);

      console.log(`✅ Partner validated: ${partner.name} in ${city.name}`);
    } else {
      // 3.  If no partnerId, require manual venue input
      if (!createEventDto.venue) {
        throw new BadRequestException(
          'Venue name is required when no partner is selected'
        );
      }
      if (!createEventDto.address) {
        throw new BadRequestException(
          'Address is required when no partner is selected'
        );
      }

      venueData = {
        venue: createEventDto.venue,
        address: createEventDto.address,
        latitude: createEventDto.latitude,
        longitude: createEventDto.longitude,
        googleMapsUrl: createEventDto.googleMapsUrl,
      };
    }

    // 4. Generate slug
    const slug = await this.generateSlug(createEventDto.title);

    // 5. Create event
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        slug,
        eventDate: new Date(createEventDto.eventDate),
        startTime: new Date(createEventDto.startTime),
        endTime: new Date(createEventDto.endTime),
        city: city.name, // Auto-fill legacy city string
        cityId: createEventDto.cityId,
        partnerId: partnerId || null,
        ...venueData, // Auto-filled from partner or manual input
      },
      include: {
        cityRelation: true,
        partner: true,
      },
    });

    return {
      message: 'Event created successfully',
      event,
    };
  }

  /**
   * Update event with partner location validation
   */
  async updateEvent(eventId: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    let slug = existingEvent.slug;
    let venueData: any = {};
    let cityName = existingEvent.city;

    // Regenerate slug if title changed
    if (updateEventDto.title && updateEventDto.title !== existingEvent.title) {
      slug = await this.generateSlug(updateEventDto.title, eventId);
    }

    // Validate city if changed
    if (updateEventDto.cityId && updateEventDto.cityId !== existingEvent.cityId) {
      const city = await this.prisma.city.findUnique({
        where: { id: updateEventDto.cityId },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      cityName = city.name;

      // If city changed and partnerId exists, validate partner is in new city
      const partnerIdToCheck = updateEventDto.partnerId ?? existingEvent.partnerId;
      if (partnerIdToCheck) {
        const partner = await this.validatePartnerLocation(
          partnerIdToCheck,
          updateEventDto.cityId
        );
        venueData = this.extractVenueDataFromPartner(partner);
      }
    }

    // If only partnerId changed (city stays same)
    if (
      updateEventDto.partnerId &&
      updateEventDto.partnerId !== existingEvent.partnerId &&
      !updateEventDto.cityId
    ) {
      const partner = await this.validatePartnerLocation(
        updateEventDto.partnerId,
        existingEvent.cityId!
      );
      venueData = this.extractVenueDataFromPartner(partner);
    }

    // If partnerId is being removed (set to null)
    if (updateEventDto.partnerId === null) {
      if (!updateEventDto.venue) {
        throw new BadRequestException(
          'Venue name is required when removing partner'
        );
      }
      if (!updateEventDto.address) {
        throw new BadRequestException(
          'Address is required when removing partner'
        );
      }
    }

    const updateData: any = {
      ...updateEventDto,
      slug,
      city: cityName,
      ...venueData,
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
      include: {
        cityRelation: true,
        partner: true,
      },
    });

    return {
      message: 'Event updated successfully',
      event,
    };
  }

  // ...  (rest of the methods remain the same - getEvents, getPublicEvents, etc.)
  // ... (copying the rest from the original file for completeness)

  async getEvents(queryDto: QueryEventsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'eventDate',
      sortOrder = SortOrder.ASC,
      category,
      status,
      isActive,
      isFeatured,
      city,
      dateFrom,
      dateTo,
    } = queryDto;

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { organizerName: { contains: search, mode: 'insensitive' } },
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

    const skip = (page - 1) * limit;
    const take = limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              isPreferred: true,
              type: true,
            }
          },
          cityRelation: {
            select: {
              id: true,
              name: true,
              slug: true,
              timezone: true,
            }
          }
        }
      }),
      this.prisma.event.count({ where }),
    ]);

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

  async getPublicEvents(queryDto: QueryEventsDto, user?: User) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'eventDate',
      sortOrder = SortOrder.ASC,
      category,
      status,
      isActive,
      isFeatured,
      city,
      dateFrom,
      dateTo,
    } = queryDto;

    const where: Prisma.EventWhereInput = {
      NOT: { category: EventCategory.DAYDREAM },
      status: EventStatus.PUBLISHED,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { organizerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by user's current country (derived from currentCityId)
    if (user?.currentCityId) {
      const userCity = await this.prisma.city.findUnique({
        where: { id: user.currentCityId },
        select: { countryId: true },
      });
      if (userCity) {
        where.cityRelation = { countryId: userCity.countryId };
      }
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

    const skip = (page - 1) * limit;
    const take = limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              isPreferred: true,
              type: true,
            }
          },
          cityRelation: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        }
      }),
      this.prisma.event.count({ where }),
    ]);

    let filteredEvents = events;

    if (user?.id) {
      const userPurchasedEvents = await this.prisma.transaction.findMany({
        where: {
          userId: user.id,
          status: PaymentStatus.PAID,
        },
        select: {
          eventId: true,
        },
      });

      const purchasedEventIds = new Set(
        userPurchasedEvents
          .map((t) => t.eventId)
          .filter((id): id is string => id !== null)
      );

      filteredEvents = events.filter((event) => {
        if (purchasedEventIds.has(event.id)) {
          return true;
        }
        return !this.isEventWithin24Hours(event.eventDate, event.startTime);
      });
    } else {
      filteredEvents = events.filter((event) => {
        return !this.isEventWithin24Hours(event.eventDate, event.startTime);
      });
    }

    const filteredTotal = filteredEvents.length;
    const totalPages = Math.ceil(filteredTotal / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: filteredEvents,
      pagination: {
        total: filteredTotal,
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

  async getNextWeekEvents(user?: User) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    // Base where clause
    const where: Prisma.EventWhereInput = {
      eventDate: {
        gte: now,
        lte: nextWeek,
      },
      status: EventStatus.PUBLISHED,
      isActive: true,
      category: {
        not: EventCategory.DAYDREAM,
      },
    };

    // If user has current city, filter by its country
    if (user?.currentCityId) {
      const userCity = await this.prisma.city.findUnique({
        where: { id: user.currentCityId },
        select: { countryId: true },
      });
      if (userCity) {
        where.cityRelation = { countryId: userCity.countryId };
      }
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: {
        eventDate: 'asc',
      },
      include: {
        partner: true,
        cityRelation: true,
      },
    });

    const filteredEvents = events.filter((event) => {
      return !this.isEventWithin24Hours(event.eventDate, event.startTime);
    });

    return {
      data: filteredEvents.slice(0, 10),
      dateRange: {
        from: now.toISOString(),
        to: nextWeek.toISOString(),
      },
      total: filteredEvents.slice(0, 10).length,
    };
  }

  async getEventById(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        cityRelation: true,
        partner: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async getEventBySlug(slug: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        partner: true,
        cityRelation: true,
      }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isWithin24Hours = this.isEventWithin24Hours(event.eventDate, event.startTime);

    if (isWithin24Hours && userId) {
      const hasPurchased = await this.hasUserPurchasedEvent(userId, event.id);

      if (!hasPurchased) {
        throw new ForbiddenException(
          'This event is no longer available for viewing. Registration closes 24 hours before the event starts.'
        );
      }
    } else if (isWithin24Hours && !userId) {
      throw new ForbiddenException(
        'This event is no longer available for viewing. Registration closes 24 hours before the event starts.'
      );
    }

    return event;
  }

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

  async getEventParticipants(eventId: string, queryDto: QueryEventParticipantsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = ParticipantSortField.PAID_AT,
      sortOrder = SortOrder.DESC,
      paymentStatus,
    } = queryDto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const where: Prisma.TransactionWhereInput = {
      eventId,
      transactionType: TransactionType.EVENT,
    };

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ]
          }
        },
      ];
    }

    if (paymentStatus) {
      where.status = paymentStatus;
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [transactions, total, paidCount, totalRevenue] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              profilePicture: true,
              isEmailVerified: true,
              createdAt: true,
              personalityResult: {
                select: {
                  archetype: true,
                  profileScore: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.count({
        where: {
          ...where,
          status: PaymentStatus.PAID,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...where,
          status: PaymentStatus.PAID,
        },
        _sum: {
          finalAmount: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      event: {
        id: event.id,
        title: event.title,
      },
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      statistics: {
        totalTransactions: total,
        paidTransactions: paidCount,
        pendingTransactions: total - paidCount,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
      },
      filters: {
        search,
        paymentStatus,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  async getParticipantDetail(eventId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        eventId,
        transactionType: TransactionType.EVENT,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            profilePicture: true,
            provider: true,
            isEmailVerified: true,
            isActive: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            personalityResult: {
              select: {
                archetype: true,
                profileScore: true,
                energyScore: true,
                opennessScore: true,
                structureScore: true,
                affectScore: true,
                comfortScore: true,
                lifestyleScore: true,
                relationshipStatus: true,
                intentOnDaylight: true,
                genderMixComfort: true,
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            venue: true,
            address: true,
            city: true,
            price: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Participant not found');
    }

    return transaction;
  }

  async exportEventParticipants(eventId: string, queryDto: QueryEventParticipantsDto) {
    const { search, paymentStatus } = queryDto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const where: Prisma.TransactionWhereInput = {
      eventId,
      transactionType: TransactionType.EVENT,
    };

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (paymentStatus) {
      where.status = paymentStatus;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return transactions;
  }

  async updateCurrentParticipants(eventId: string, delta: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { currentParticipants: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const updatedParticipants = (event.currentParticipants || 0) + delta;

    await this.prisma.event.update({
      where: { id: eventId },
      data: { currentParticipants: updatedParticipants },
    });
  }
}