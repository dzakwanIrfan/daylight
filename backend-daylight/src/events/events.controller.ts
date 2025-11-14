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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BulkActionEventDto } from './dto/bulk-action-event.dto';
import { UploadService } from '../upload/upload.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private uploadService: UploadService,
  ) {}

  /**
   * Upload event banner
   */
  @Post('upload/banner')
  @UseInterceptors(FileInterceptor('banner'))
  async uploadBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.uploadFile(file, {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      folder: 'events',
    });
  }

  /**
   * Get dashboard statistics
   */
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.eventsService.getDashboardStats();
  }

  /**
   * Get all events
   */
  @Get()
  async getEvents(@Query() queryDto: QueryEventsDto) {
    return this.eventsService.getEvents(queryDto);
  }

  /**
   * Export events
   */
  @Get('export')
  async exportEvents(@Query() queryDto: QueryEventsDto) {
    return this.eventsService.exportEvents(queryDto);
  }

  /**
   * Get event by ID
   */
  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  /**
   * Create event
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  /**
   * Update event
   */
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  /**
   * Delete event
   */
  @Delete(':id')
  async deleteEvent(@Param('id') id: string, @Query('hard') hard?: string) {
    const hardDelete = hard === 'true';
    return this.eventsService.deleteEvent(id, hardDelete);
  }

  /**
   * Bulk actions
   */
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionEventDto) {
    return this.eventsService.bulkAction(bulkActionDto);
  }
}