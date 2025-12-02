import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PartnersService } from './partners.service';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { QueryPartnersDto } from './dto/query-partners.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { BulkActionPartnerDto } from './dto/bulk-action-partner.dto';

@Controller('partners')
export class PartnersController {
  constructor(
    private partnersService: PartnersService,
    private uploadService: UploadService,
  ) {}

  // PUBLIC ENDPOINTS

  @Public()
  @Get('public')
  async getPublicPartners(@Query() queryDto: QueryPartnersDto) {
    return this.partnersService.getPartners({
      ...queryDto,
      isActive: true,
      status: 'ACTIVE' as any,
    });
  }

  @Public()
  @Get('public/:slug')
  async getPublicPartnerBySlug(@Param('slug') slug: string) {
    return this.partnersService.getPartnerBySlug(slug);
  }

  // ADMIN ENDPOINTS

  /**
   * Get partners by city (Helper for Event Form)
   * Admin only - Used when creating/editing events
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('by-city/:cityId')
  async getPartnersByCity(@Param('cityId') cityId: string) {
    return this.partnersService.getPartnersByCity(cityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('available')
  async getAvailablePartnersForEvent() {
    return this.partnersService.getAvailablePartnersForEvent();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.partnersService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getPartners(@Query() queryDto: QueryPartnersDto) {
    return this.partnersService.getPartners(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('export')
  async exportPartners(@Query() queryDto: QueryPartnersDto) {
    return this.partnersService.exportPartners(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getPartnerById(@Param('id') id: string) {
    return this.partnersService.getPartnerById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPartner(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.createPartner(createPartnerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updatePartner(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.updatePartner(id, updatePartnerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deletePartner(@Param('id') id: string, @Query('hard') hard?: string) {
    const hardDelete = hard === 'true';
    return this.partnersService.deletePartner(id, hardDelete);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionPartnerDto) {
    return this.partnersService.bulkAction(bulkActionDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/upload/logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.uploadService.uploadFile(file, {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      maxSize: 5 * 1024 * 1024,
      folder: 'logos',
    });

    return this.partnersService.uploadPartnerImage(id, 'logo', uploadResult.url);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole. ADMIN)
  @Post(':id/upload/cover')
  @UseInterceptors(FileInterceptor('cover'))
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express. Multer.File,
  ) {
    const uploadResult = await this.uploadService.uploadFile(file, {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      maxSize: 10 * 1024 * 1024,
      folder: 'covers',
    });

    return this.partnersService.uploadPartnerImage(id, 'cover', uploadResult.url);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/upload/gallery')
  @UseInterceptors(FileInterceptor('image'))
  async uploadGalleryImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.uploadService.uploadFile(file, {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      maxSize: 10 * 1024 * 1024,
      folder: 'gallery',
    });

    return this.partnersService.uploadPartnerImage(id, 'gallery', uploadResult.url);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id/gallery/image')
  async removeGalleryImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.partnersService.removeGalleryImage(id, imageUrl);
  }
}