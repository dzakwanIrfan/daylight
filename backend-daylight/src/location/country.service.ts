import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryCountryDto } from './dto/query-country.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { BulkActionCountryDto, CountryBulkActionType } from './dto/bulk-action-country.dto';

@Injectable()
export class CountryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCountryAll(queryDto: QueryCountryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
    } = queryDto;

    const where: Prisma.CountryWhereInput = {};

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { currency: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Execute query
    const [countries, total] = await Promise.all([
      this.prismaService.country.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { cities: true },
          },
        },
      }),
      this.prismaService. country.count({ where }),
    ]);

    const totalPages = Math. ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: countries,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  async getCountryById(id: string) {
    const country = await this.prismaService.country.findUnique({
      where: { id },
      include: {
        cities: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { cities: true },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Country not found');
    }

    return country;
  }

  async createCountry(createDto: CreateCountryDto) {
    // Check if code already exists
    const existingCountry = await this.prismaService.country.findUnique({
      where: { code: createDto.code },
    });

    if (existingCountry) {
      throw new ConflictException('Country code already exists');
    }

    const country = await this.prismaService.country. create({
      data: {
        code: createDto.code. toUpperCase(),
        name: createDto.name,
        currency: createDto. currency. toUpperCase(),
        phoneCode: createDto.phoneCode,
      },
      include: {
        _count: {
          select: { cities: true },
        },
      },
    });

    return {
      message: 'Country created successfully',
      data: country,
    };
  }

  async updateCountry(id: string, updateDto: UpdateCountryDto) {
    // Check if country exists
    const existingCountry = await this.prismaService.country.findUnique({
      where: { id },
    });

    if (! existingCountry) {
      throw new NotFoundException('Country not found');
    }

    // Check if code is being changed and if it's already taken
    if (updateDto.code && updateDto.code !== existingCountry.code) {
      const codeTaken = await this.prismaService. country.findUnique({
        where: { code: updateDto.code },
      });

      if (codeTaken) {
        throw new ConflictException('Country code already exists');
      }
    }

    const updatedCountry = await this.prismaService.country.update({
      where: { id },
      data: {
        code: updateDto.code?.toUpperCase(),
        name: updateDto.name,
        currency: updateDto.currency?.toUpperCase(),
        phoneCode: updateDto. phoneCode,
      },
      include: {
        _count: {
          select: { cities: true },
        },
      },
    });

    return {
      message: 'Country updated successfully',
      data: updatedCountry,
    };
  }

  async deleteCountry(id: string) {
    const country = await this.prismaService.country. findUnique({
      where: { id },
      include: {
        _count: {
          select: { cities: true },
        },
      },
    });

    if (! country) {
      throw new NotFoundException('Country not found');
    }

    // Check if country has cities
    if (country._count. cities > 0) {
      throw new BadRequestException(
        `Cannot delete country with ${country._count.cities} cities.  Please delete the cities first.`
      );
    }

    await this. prismaService.country.delete({
      where: { id },
    });

    return {
      message: 'Country deleted successfully',
    };
  }

  async bulkAction(bulkActionDto: BulkActionCountryDto) {
    const { countryIds, action } = bulkActionDto;

    // Validate country IDs
    const countries = await this.prismaService.country. findMany({
      where: { id: { in: countryIds } },
      include: {
        _count: {
          select: { cities: true },
        },
      },
    });

    if (countries.length !== countryIds.length) {
      throw new BadRequestException('Some country IDs are invalid');
    }

    let result;

    switch (action) {
      case CountryBulkActionType.DELETE:
        // Check if any country has cities
        const countriesWithCities = countries.filter(c => c._count. cities > 0);
        if (countriesWithCities.length > 0) {
          throw new BadRequestException(
            `Cannot delete ${countriesWithCities.length} countries that have cities. Please delete the cities first.`
          );
        }

        result = await this.prismaService.country.deleteMany({
          where: { id: { in: countryIds } },
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

  async exportCountries(queryDto: QueryCountryDto) {
    const { search } = queryDto;

    const where: Prisma. CountryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const countries = await this.prismaService.country.findMany({
      where,
      include: {
        _count: {
          select: { cities: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return countries;
  }

  // Helper method to get all countries for dropdown
  async getCountryOptions() {
    const countries = await this.prismaService. country.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return countries;
  }
}