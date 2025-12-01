import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CountryService } from './country.service';
import { QueryCountryDto } from './dto/query-country.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { BulkActionCountryDto } from './dto/bulk-action-country.dto';

@Controller('locations/countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Get()
  async getCountryAll(@Query() queryDto: QueryCountryDto) {
    return this.countryService. getCountryAll(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Get('export')
  async exportCountries(@Query() queryDto: QueryCountryDto) {
    return this.countryService.exportCountries(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('options')
  async getCountryOptions() {
    return this.countryService. getCountryOptions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getCountryById(@Param('id') id: string) {
    return this. countryService.getCountryById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCountry(@Body() createDto: CreateCountryDto) {
    return this.countryService.createCountry(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Put(':id')
  async updateCountry(@Param('id') id: string, @Body() updateDto: UpdateCountryDto) {
    return this.countryService.updateCountry(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteCountry(@Param('id') id: string) {
    return this.countryService.deleteCountry(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionCountryDto) {
    return this.countryService.bulkAction(bulkActionDto);
  }
}