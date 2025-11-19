import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  /**
   * Trigger matching for an event (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/match')
  @HttpCode(HttpStatus.OK)
  async matchEventParticipants(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    const matchingResult = await this.matchingService.matchEventParticipants(
      eventId,
      user.id,
    );

    // Save results to database (replaces old results)
    await this.matchingService.saveMatchingResults(eventId, matchingResult);

    return {
      message: 'Matching completed successfully',
      result: matchingResult,
    };
  }

  /**
   * Get matching results for an event (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('events/:eventId/results')
  async getMatchingResults(@Param('eventId') eventId: string) {
    const groups = await this.matchingService.getMatchingResults(eventId);

    return {
      eventId,
      totalGroups: groups.length,
      groups,
    };
  }

  /**
   * Get matching attempt history (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('events/:eventId/history')
  async getMatchingHistory(@Param('eventId') eventId: string) {
    const history = await this.matchingService.getMatchingAttemptHistory(eventId);
    return {
      eventId,
      totalAttempts: history.length,
      history,
    };
  }

  /**
   * Get user's matching group for an event
   */
  @UseGuards(JwtAuthGuard)
  @Get('events/:eventId/my-group')
  async getMyMatchingGroup(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    return this.matchingService.getUserMatchingGroup(eventId, user.id);
  }

  /**
   * Preview matching without saving (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/preview')
  @HttpCode(HttpStatus.OK)
  async previewMatching(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    const matchingResult = await this.matchingService.matchEventParticipants(
      eventId,
      user.id,
    );

    return {
      message: 'Preview generated (not saved to groups)',
      result: matchingResult,
    };
  }
}