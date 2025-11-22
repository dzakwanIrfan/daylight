import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsExportService } from './analytics-export.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { UpdateDurationDto } from './dto/update-duration.dto';
import { ExportAnalyticsDto, ExportFormat, ExportType } from './dto/export-analytics.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private analyticsExportService: AnalyticsExportService,
  ) {}

  /**
   * Track page view - public endpoint for all users
   */
  @Public()
  @Post('track')
  @HttpCode(HttpStatus.OK)
  async trackPageView(
    @Body() dto: TrackPageViewDto,
    @Req() req: Request,
    @CurrentUser() user?: any,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = this.getClientIp(req);
    const userId = user?.id;

    return this.analyticsService.trackPageView(dto, userAgent, ip, userId);
  }

  /**
   * Update page view duration when user leaves page
   */
  @Public()
  @Patch('track/:id/duration')
  @HttpCode(HttpStatus.OK)
  async updateDuration(
    @Param('id') id: string,
    @Body() dto: UpdateDurationDto,
  ) {
    return this.analyticsService.updatePageViewDuration(id, dto.duration);
  }

  /**
   * Get analytics overview - admin only
   */
  @Get('overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getOverview(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.analyticsService.getAnalyticsOverview(start, end);
  }

  /**
   * Get page views over time - admin only
   */
  @Get('timeline')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTimeline(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'hour' | 'day' | 'week' = 'day',
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.analyticsService.getPageViewsOverTime(start, end, granularity);
  }

  /**
   * Get real-time users - admin only
   */
  @Get('realtime')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRealtimeUsers() {
    return this.analyticsService.getRealtimeUsers();
  }

  /**
   * Get historical analytics - admin only
   */
  @Get('historical')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getHistorical(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.analyticsService.getHistoricalAnalytics(start, end);
  }

  /**
   * Export analytics data - admin only
   */
  @Get('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format: ExportFormat = ExportFormat.CSV,
    @Query('type') type: ExportType = ExportType.FULL_REPORT,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    // Limit to 1 year of data
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > oneYearMs) {
      throw new BadRequestException('Date range cannot exceed 1 year');
    }

    const result = await this.analyticsExportService.exportAnalytics(
      start,
      end,
      format,
      type,
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);

    res.send(result.buffer);
  }

  /**
   * Extract client IP from request
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}