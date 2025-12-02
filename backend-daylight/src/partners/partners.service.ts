import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PartnerStatus, PartnerType } from '@prisma/client';
import { QueryPartnersDto, SortOrder } from './dto/query-partners.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { BulkActionPartnerDto, PartnerBulkActionType } from './dto/bulk-action-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique slug from name
   */
  private async generateSlug(name: string, excludeId?: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      . replace(/(^-|-$)/g, '');

    let counter = 0;
    let uniqueSlug = slug;

    while (true) {
      const existing = await this.prisma.partner.findUnique({
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
   * Get partners by city (Helper for Event Form)
   * Returns only active partners in a specific city
   */
  async getPartnersByCity(cityId: string) {
    // Validate city exists
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    const partners = await this.prisma. partner.findMany({
      where: {
        cityId,
        isActive: true,
        status: PartnerStatus. ACTIVE,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        address: true,
        logo: true,
        isPreferred: true,
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
        phoneNumber: true,
        email: true,
        cityId: true,
      },
      orderBy: [
        { isPreferred: 'desc' },
        { name: 'asc' },
      ],
    });

    return {
      city: {
        id: city.id,
        name: city.name,
        slug: city.slug,
      },
      partners,
      total: partners.length,
    };
  }

  /**
   * Get partners with filtering, sorting, and pagination
   */
  async getPartners(queryDto: QueryPartnersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
      type,
      status,
      isActive,
      isPreferred,
      isFeatured,
      city,
    } = queryDto;

    const where: Prisma.PartnerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where. type = type;
    if (status) where.status = status;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isPreferred === 'boolean') where.isPreferred = isPreferred;
    if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const skip = (page - 1) * limit;
    const take = limit;

    const [partners, total] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { events: true },
          },
          cityRelation: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          }
        },
      }),
      this.prisma. partner.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: partners,
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
        type,
        status,
        isActive,
        isPreferred,
        isFeatured,
        city,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  async getPartnerById(partnerId: string) {
    const partner = await this.prisma.partner. findUnique({
      where: { id: partnerId },
      include: {
        cityRelation: true,
        events: {
          select: {
            id: true,
            title: true,
            slug: true,
            eventDate: true,
            status: true,
          },
          orderBy: {
            eventDate: 'desc',
          },
        },
        _count: {
          select: { events: true },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return partner;
  }

  async getPartnerBySlug(slug: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { slug },
      include: {
        cityRelation: true,
        events: {
          where: {
            status: 'PUBLISHED',
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            eventDate: true,
            venue: true,
            city: true,
            price: true,
          },
          orderBy: {
            eventDate: 'asc',
          },
        },
      },
    });

    if (! partner) {
      throw new NotFoundException('Partner not found');
    }

    await this.prisma.partner.update({
      where: { id: partner.id },
      data: { viewCount: { increment: 1 } },
    });

    return partner;
  }

  async createPartner(createPartnerDto: CreatePartnerDto) {
    // Validate cityId exists
    const city = await this. prisma.city.findUnique({
      where: { id: createPartnerDto.cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    const slug = await this.generateSlug(createPartnerDto.name);

    const partner = await this. prisma.partner.create({
      data: {
        ...createPartnerDto,
        slug,
        city: city.name, // Auto-fill legacy city field
      },
      include: {
        cityRelation: true,
      },
    });

    return {
      message: 'Partner created successfully',
      partner,
    };
  }

  async updatePartner(partnerId: string, updatePartnerDto: UpdatePartnerDto) {
    const existingPartner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!existingPartner) {
      throw new NotFoundException('Partner not found');
    }

    let slug = existingPartner.slug;
    let cityName = existingPartner.city;

    if (updatePartnerDto.name && updatePartnerDto.name !== existingPartner.name) {
      slug = await this.generateSlug(updatePartnerDto.name, partnerId);
    }

    // If cityId changed, validate and update city name
    if (updatePartnerDto.cityId && updatePartnerDto.cityId !== existingPartner.cityId) {
      const city = await this.prisma. city.findUnique({
        where: { id: updatePartnerDto.cityId },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }

      cityName = city.name;
    }

    const partner = await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        ...updatePartnerDto,
        slug,
        city: cityName,
      },
      include: {
        cityRelation: true,
      },
    });

    return {
      message: 'Partner updated successfully',
      partner,
    };
  }

  async deletePartner(partnerId: string, hardDelete: boolean = false) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (partner._count.events > 0 && hardDelete) {
      throw new BadRequestException(
        `Cannot delete partner with ${partner._count.events} associated event(s).  Please remove or reassign events first.`
      );
    }

    if (hardDelete) {
      await this. prisma.partner.delete({
        where: { id: partnerId },
      });

      return {
        message: 'Partner permanently deleted',
      };
    } else {
      await this.prisma.partner.update({
        where: { id: partnerId },
        data: { isActive: false, status: PartnerStatus. INACTIVE },
      });

      return {
        message: 'Partner deactivated',
      };
    }
  }

  async bulkAction(bulkActionDto: BulkActionPartnerDto) {
    const { partnerIds, action } = bulkActionDto;

    const partners = await this.prisma.partner. findMany({
      where: { id: { in: partnerIds } },
      select: { id: true },
    });

    if (partners.length !== partnerIds.length) {
      throw new BadRequestException('Some partner IDs are invalid');
    }

    let result;

    switch (action) {
      case PartnerBulkActionType.ACTIVATE:
        result = await this. prisma.partner.updateMany({
          where: { id: { in: partnerIds } },
          data: { isActive: true },
        });
        break;

      case PartnerBulkActionType.DEACTIVATE:
        result = await this. prisma.partner.updateMany({
          where: { id: { in: partnerIds } },
          data: { isActive: false },
        });
        break;

      case PartnerBulkActionType.DELETE:
        const partnersWithEvents = await this.prisma. partner.findMany({
          where: { id: { in: partnerIds } },
          include: {
            _count: {
              select: { events: true },
            },
          },
        });

        const hasEvents = partnersWithEvents.some((p) => p._count.events > 0);
        if (hasEvents) {
          throw new BadRequestException(
            'Cannot delete partners with associated events'
          );
        }

        result = await this.prisma. partner.deleteMany({
          where: { id: { in: partnerIds } },
        });
        break;

      case PartnerBulkActionType.MARK_PREFERRED:
        result = await this. prisma.partner.updateMany({
          where: { id: { in: partnerIds } },
          data: { isPreferred: true },
        });
        break;

      case PartnerBulkActionType.UNMARK_PREFERRED:
        result = await this.prisma.partner.updateMany({
          where: { id: { in: partnerIds } },
          data: { isPreferred: false },
        });
        break;

      case PartnerBulkActionType.APPROVE:
        result = await this. prisma.partner.updateMany({
          where: { id: { in: partnerIds } },
          data: { status: PartnerStatus.ACTIVE, isActive: true },
        });
        break;

      case PartnerBulkActionType.REJECT:
        result = await this. prisma.partner.updateMany({
          where: { id: { in: partnerIds } },
          data: { status: PartnerStatus.REJECTED, isActive: false },
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
    const [
      totalPartners,
      activePartners,
      preferredPartners,
      pendingPartners,
      partnersByType,
      partnersByStatus,
      topPartners,
    ] = await Promise.all([
      this. prisma.partner.count(),
      this.prisma.partner. count({ 
        where: { 
          isActive: true, 
          status: PartnerStatus.ACTIVE 
        } 
      }),
      this.prisma.partner.count({
        where: {
          isPreferred: true,
          isActive: true,
        },
      }),
      this.prisma.partner.count({ 
        where: { status: PartnerStatus.PENDING } 
      }),
      this.prisma.partner.groupBy({
        by: ['type'],
        _count: true,
      }),
      this. prisma.partner.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma. partner.findMany({
        take: 10,
        orderBy: { totalEvents: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          totalEvents: true,
          viewCount: true,
          isPreferred: true,
          logo: true,
        },
      }),
    ]);

    return {
      overview: {
        totalPartners,
        activePartners,
        preferredPartners,
        pendingPartners,
      },
      breakdown: {
        byType: partnersByType. map((item) => ({
          type: item.type,
          count: item._count,
        })),
        byStatus: partnersByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
      },
      topPartners,
    };
  }

  async exportPartners(queryDto: QueryPartnersDto) {
    const { 
      search, 
      type, 
      status, 
      isActive, 
      isPreferred, 
      isFeatured, 
      city 
    } = queryDto;

    const where: Prisma.PartnerWhereInput = {};

    if (search) {
      where. OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isPreferred === 'boolean') where.isPreferred = isPreferred;
    if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
    if (city) where. city = { contains: city, mode: 'insensitive' };

    const partners = await this. prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    return partners;
  }

  async getAvailablePartnersForEvent() {
    return this.prisma.partner.findMany({
      where: {
        isActive: true,
        status: PartnerStatus. ACTIVE,
      },
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        cityId: true,
        address: true,
        logo: true,
        isPreferred: true,
      },
      orderBy: [
        { isPreferred: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async uploadPartnerImage(partnerId: string, imageType: 'logo' | 'cover' | 'gallery', imageUrl: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    let updateData: any = {};

    if (imageType === 'logo') {
      updateData. logo = imageUrl;
    } else if (imageType === 'cover') {
      updateData. coverImage = imageUrl;
    } else if (imageType === 'gallery') {
      updateData. gallery = {
        push: imageUrl,
      };
    }

    const updatedPartner = await this. prisma.partner.update({
      where: { id: partnerId },
      data: updateData,
    });

    return {
      message: `${imageType} uploaded successfully`,
      partner: updatedPartner,
    };
  }

  async removeGalleryImage(partnerId: string, imageUrl: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const updatedGallery = partner.gallery.filter((url) => url !== imageUrl);

    const updatedPartner = await this. prisma.partner.update({
      where: { id: partnerId },
      data: { gallery: updatedGallery },
    });

    return {
      message: 'Image removed from gallery',
      partner: updatedPartner,
    };
  }
}