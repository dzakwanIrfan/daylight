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
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BulkActionEventDto } from './dto/bulk-action-event.dto';
import { QueryEventParticipantsDto } from './dto/query-event-participants.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // PUBLIC ENDPOINTS

  /**
   * Get all public events (with 24h restriction)
   * Can be accessed without auth, but userId helps with filtering
   */
  @UseGuards(JwtAuthGuard)
  @Get('public')
  async getPublicEvents(
    @Query() queryDto: QueryEventsDto,
    @CurrentUser() user?: User,
  ) {
    return this.eventsService.getPublicEvents(queryDto, user);
  }

  /**
   * Get events for next week (with 24h restriction)
   */
  @UseGuards(JwtAuthGuard)
  @Get('public/next-week')
  async getNextWeekEvents(@CurrentUser() user?: User) {
    return this.eventsService.getNextWeekEvents(user);
  }

  /**
   * Get event by slug (with 24h restriction for non-purchasers)
   */
  @UseGuards(JwtAuthGuard)
  @Get('public/:slug')
  async getPublicEventBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: User,
  ) {
    return this.eventsService.getEventBySlug(slug, user?.id);
  }

  /**
   * Check user's purchase status for an event
   */
  @UseGuards(JwtAuthGuard)
  @Get('public/:slug/purchase-status')
  async checkUserPurchaseStatus(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ) {
    return this.eventsService.checkUserPurchaseStatus(slug, user.id);
  }

  // ADMIN ENDPOINTS

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.eventsService.getDashboardStats();
  }

  /**
   * Admin: Get all events without 24h restriction
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getEvents(@Query() queryDto: QueryEventsDto) {
    return this.eventsService.getEvents(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('export')
  async exportEvents(@Query() queryDto: QueryEventsDto) {
    return this.eventsService.exportEvents(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteEvent(@Param('id') id: string, @Query('hard') hard?: string) {
    const hardDelete = hard === 'true';
    return this.eventsService.deleteEvent(id, hardDelete);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionEventDto) {
    return this.eventsService.bulkAction(bulkActionDto);
  }

  /**
   * Get event participants (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id/participants')
  async getEventParticipants(
    @Param('id') id: string,
    @Query() queryDto: QueryEventParticipantsDto,
  ) {
    return this.eventsService.getEventParticipants(id, queryDto);
  }

  /**
   * Get participant detail (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id/participants/:transactionId')
  async getParticipantDetail(
    @Param('id') eventId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.eventsService.getParticipantDetail(eventId, transactionId);
  }

  /**
   * Export event participants (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id/participants/export')
  async exportEventParticipants(
    @Param('id') id: string,
    @Query() queryDto: QueryEventParticipantsDto,
  ) {
    return this.eventsService.exportEventParticipants(id, queryDto);
  }
}