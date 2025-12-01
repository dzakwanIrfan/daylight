import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryCityDto } from './dto/query-city.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { BulkActionCityDto, CityBulkActionType } from './dto/bulk-action-city.dto';

@Injectable()
export class CityService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCityAll(queryDto: QueryCityDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      countryId,
      isActive,
    } = queryDto;

    const where: Prisma.CityWhereInput = {};

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { timezone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (countryId) where.countryId = countryId;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Execute query
    const [cities, total] = await Promise.all([
      this.prismaService.city.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          country: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: { 
              users: true,
              events: true,
            },
          },
        },
      }),
      this.prismaService.city. count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: cities,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        countryId,
        isActive,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  async getCityById(id: string) {
    const city = await this.prismaService.city.findUnique({
      where: { id },
      include: {
        country: true,
        _count: {
          select: { 
            users: true,
            events: true,
          },
        },
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return city;
  }

  async createCity(createDto: CreateCityDto) {
    // Check if country exists
    const country = await this.prismaService.country. findUnique({
      where: { id: createDto.countryId },
    });

    if (! country) {
      throw new NotFoundException('Country not found');
    }

    // Check if slug already exists
    const existingCity = await this.prismaService. city.findUnique({
      where: { slug: createDto.slug },
    });

    if (existingCity) {
      throw new ConflictException('City slug already exists');
    }

    const city = await this. prismaService.city.create({
      data: {
        slug: createDto.slug. toLowerCase(),
        name: createDto.name,
        timezone: createDto.timezone,
        countryId: createDto.countryId,
        isActive: createDto.isActive ??  true,
      },
      include: {
        country: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: { 
            users: true,
            events: true,
          },
        },
      },
    });

    return {
      message: 'City created successfully',
      data: city,
    };
  }

  async updateCity(id: string, updateDto: UpdateCityDto) {
    // Check if city exists
    const existingCity = await this.prismaService. city.findUnique({
      where: { id },
    });

    if (! existingCity) {
      throw new NotFoundException('City not found');
    }

    // Check if slug is being changed and if it's already taken
    if (updateDto.slug && updateDto.slug !== existingCity.slug) {
      const slugTaken = await this. prismaService.city.findUnique({
        where: { slug: updateDto. slug },
      });

      if (slugTaken) {
        throw new ConflictException('City slug already exists');
      }
    }

    // Check if country exists when updating countryId
    if (updateDto.countryId) {
      const country = await this.prismaService.country. findUnique({
        where: { id: updateDto.countryId },
      });

      if (! country) {
        throw new NotFoundException('Country not found');
      }
    }

    const updatedCity = await this. prismaService.city.update({
      where: { id },
      data: {
        slug: updateDto.slug?.toLowerCase(),
        name: updateDto.name,
        timezone: updateDto.timezone,
        countryId: updateDto.countryId,
        isActive: updateDto. isActive,
      },
      include: {
        country: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: { 
            users: true,
            events: true,
          },
        },
      },
    });

    return {
      message: 'City updated successfully',
      data: updatedCity,
    };
  }

  async deleteCity(id: string) {
    const city = await this. prismaService.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            users: true,
            events: true,
          },
        },
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    // Check if city has users or events
    if (city._count.users > 0 || city._count.events > 0) {
      throw new BadRequestException(
        `Cannot delete city with ${city._count. users} users and ${city._count. events} events. `
      );
    }

    await this.prismaService.city.delete({
      where: { id },
    });

    return {
      message: 'City deleted successfully',
    };
  }

  async bulkAction(bulkActionDto: BulkActionCityDto) {
    const { cityIds, action } = bulkActionDto;

    // Validate city IDs
    const cities = await this.prismaService. city.findMany({
      where: { id: { in: cityIds } },
      include: {
        _count: {
          select: { 
            users: true,
            events: true,
          },
        },
      },
    });

    if (cities.length !== cityIds.length) {
      throw new BadRequestException('Some city IDs are invalid');
    }

    let result;

    switch (action) {
      case CityBulkActionType. ACTIVATE:
        result = await this. prismaService.city.updateMany({
          where: { id: { in: cityIds } },
          data: { isActive: true },
        });
        break;

      case CityBulkActionType. DEACTIVATE:
        result = await this.prismaService. city.updateMany({
          where: { id: { in: cityIds } },
          data: { isActive: false },
        });
        break;

      case CityBulkActionType.DELETE:
        // Check if any city has users or events
        const citiesInUse = cities. filter(c => c._count.users > 0 || c._count.events > 0);
        if (citiesInUse.length > 0) {
          throw new BadRequestException(
            `Cannot delete ${citiesInUse.length} cities that have users or events. `
          );
        }

        result = await this.prismaService.city. deleteMany({
          where: { id: { in: cityIds } },
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

  async exportCities(queryDto: QueryCityDto) {
    const { search, countryId, isActive } = queryDto;

    const where: Prisma.CityWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (countryId) where.countryId = countryId;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    const cities = await this. prismaService.city.findMany({
      where,
      include: {
        country: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: { 
            users: true,
            events: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return cities;
  }

  // Helper method to get cities by country for dropdown
  async getCityOptions(countryId?: string) {
    const where: Prisma. CityWhereInput = {
      isActive: true,
    };

    if (countryId) {
      where. countryId = countryId;
    }

    const cities = await this.prismaService.city. findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        timezone: true,
        country: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return cities;
  }
}