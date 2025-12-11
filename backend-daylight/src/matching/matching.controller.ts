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
import type { User } from '@prisma/client';
import {
  AssignUserToGroupDto,
  MoveUserBetweenGroupsDto,
  RemoveUserFromGroupDto,
  CreateManualGroupDto,
  BulkAssignUsersDto,
} from './dto/manual-assignment.dto';

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
    @CurrentUser() user: User,
  ) {
    const matchingResult = await this.matchingService.matchEventParticipants(
      eventId,
      user.id,
    );

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
    @CurrentUser() user: User,
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
    @CurrentUser() user: User,
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

  // MANUAL ASSIGNMENT ENDPOINTS

  /**
   * Get unassigned participants (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('events/:eventId/unassigned')
  async getUnassignedParticipants(@Param('eventId') eventId: string) {
    return this.matchingService.getUnassignedParticipants(eventId);
  }

  /**
   * Manually assign user to specific group (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/assign')
  @HttpCode(HttpStatus.OK)
  async assignUserToGroup(
    @Param('eventId') eventId: string,
    @Body() dto: AssignUserToGroupDto,
    @CurrentUser() user: User,
  ) {
    console.log('AssignUserToGroupDto:', dto);
    console.log('Event ID:', eventId);
    console.log('Admin User ID:', user.id);
    return this.matchingService.assignUserToGroup(eventId, dto, user.id);
  }

  /**
   * Move user between groups (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/move')
  @HttpCode(HttpStatus.OK)
  async moveUserBetweenGroups(
    @Param('eventId') eventId: string,
    @Body() dto: MoveUserBetweenGroupsDto,
    @CurrentUser() user: User,
  ) {
    return this.matchingService.moveUserBetweenGroups(eventId, dto, user.id);
  }

  /**
   * Remove user from group (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/remove')
  @HttpCode(HttpStatus.OK)
  async removeUserFromGroup(
    @Param('eventId') eventId: string,
    @Body() dto: RemoveUserFromGroupDto,
    @CurrentUser() user: User,
  ) {
    return this.matchingService.removeUserFromGroup(eventId, dto, user.id);
  }

  /**
   * Create manual empty group (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/create-group')
  @HttpCode(HttpStatus.CREATED)
  async createManualGroup(
    @Param('eventId') eventId: string,
    @Body() dto: CreateManualGroupDto,
    @CurrentUser() user: User,
  ) {
    return this.matchingService.createManualGroup(eventId, dto, user.id);
  }

  /**
   * Bulk assign users to group (Admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('events/:eventId/bulk-assign')
  @HttpCode(HttpStatus.OK)
  async bulkAssignUsers(
    @Param('eventId') eventId: string,
    @Body() dto: BulkAssignUsersDto,
    @CurrentUser() user: User,
  ) {
    return this.matchingService.bulkAssignUsers(eventId, dto, user.id);
  }
}