import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CityService } from './city.service';
import { QueryCityDto } from './dto/query-city.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { BulkActionCityDto } from './dto/bulk-action-city.dto';

@Controller('locations/cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getCityAll(@Query() queryDto: QueryCityDto) {
    return this.cityService. getCityAll(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('export')
  async exportCities(@Query() queryDto: QueryCityDto) {
    return this.cityService.exportCities(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('options')
  async getCityOptions(@Query('countryId') countryId?: string) {
    return this.cityService.getCityOptions(countryId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getCityById(@Param('id') id: string) {
    return this. cityService.getCityById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Post()
  @HttpCode(HttpStatus. CREATED)
  async createCity(@Body() createDto: CreateCityDto) {
    return this. cityService.createCity(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Put(':id')
  async updateCity(@Param('id') id: string, @Body() updateDto: UpdateCityDto) {
    return this.cityService. updateCity(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Delete(':id')
  async deleteCity(@Param('id') id: string) {
    return this. cityService.deleteCity(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionCityDto) {
    return this.cityService.bulkAction(bulkActionDto);
  }
}