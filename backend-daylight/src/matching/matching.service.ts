import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingResult } from './types/matching.types';
import { MATCHING_CONSTANTS } from './matching.constants';
import {
  AssignUserToGroupDto,
  BulkAssignUsersDto,
  CreateManualGroupDto,
  MoveUserBetweenGroupsDto,
  RemoveUserFromGroupDto,
} from './dto/manual-assignment.dto';

// Import specialized services
import { ParticipantEligibilityService } from './services/participant-eligibility.service';
import { ScoreCalculationService } from './services/score-calculation.service';
import { MatchingAlgorithmService } from './services/matching-algorithm.service';
import { StatisticsService } from './services/statistics.service';
import { ManualAssignmentService } from './services/manual-assignment.service';
import { MatchingPersistenceService } from './services/matching-persistence.service';
import { validateEventExists } from './helpers/validation.helper';

/**
 * Matching Service (Orchestrator)
 * Coordinates specialized services to perform matching operations
 */
@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private participantService: ParticipantEligibilityService,
    private scoreService: ScoreCalculationService,
    private algorithmService: MatchingAlgorithmService,
    private statisticsService: StatisticsService,
    private manualAssignmentService: ManualAssignmentService,
    private persistenceService: MatchingPersistenceService,
  ) { }

  /**
   * Main matching function with multi-pass strategy
   */
  async matchEventParticipants(
    eventId: string,
    adminUserId?: string,
  ): Promise<MatchingResult> {
    const startTime = Date.now();

    // 1. Validate event exists
    await validateEventExists(this.prisma, eventId);

    // 2. Get eligible participants
    const participants = await this.participantService.getEligibleParticipants(
      eventId,
    );

    if (participants.length < MATCHING_CONSTANTS.MIN_GROUP_SIZE) {
      const result = this.statisticsService.createEmptyResult(
        eventId,
        participants,
        'Not enough participants. Minimum 3 required.',
      );

      // Save attempt even if failed
      await this.persistenceService.saveMatchingAttempt(
        eventId,
        result,
        adminUserId,
        (Date.now() - startTime) / 1000,
      );

      return result;
    }

    // 3. Calculate all pairwise match scores
    const allMatchScores = this.scoreService.calculateAllMatchScores(participants);

    // 4. Multi-pass matching with different thresholds
    const matchingData = await this.algorithmService.multiPassMatching(
      eventId,
      participants,
      allMatchScores,
    );

    // 5. Calculate statistics
    const statistics = this.statisticsService.calculateStatistics(
      matchingData.groups,
      participants.length,
      matchingData.unmatchedUsers.length,
    );

    const matchingResult: MatchingResult = {
      eventId,
      totalParticipants: participants.length,
      groups: matchingData.groups,
      unmatchedUsers: matchingData.unmatchedUsers,
      statistics,
      thresholdBreakdown: matchingData.thresholdBreakdown,
      warnings: matchingData.warnings,
    };

    // 6. Save attempt
    const executionTime = (Date.now() - startTime) / 1000;
    await this.persistenceService.saveMatchingAttempt(
      eventId,
      matchingResult,
      adminUserId,
      executionTime,
    );

    return matchingResult;
  }

  // ==================== DELEGATE TO MANUAL ASSIGNMENT SERVICE ====================

  /**
   * Get unassigned participants for manual assignment
   */
  async getUnassignedParticipants(eventId: string) {
    return this.participantService.getUnassignedParticipants(eventId);
  }

  /**
   * Manually assign user to specific group
   */
  async assignUserToGroup(
    eventId: string,
    dto: AssignUserToGroupDto,
    adminUserId: string,
  ) {
    return this.manualAssignmentService.assignUserToGroup(
      eventId,
      dto,
      adminUserId,
    );
  }

  /**
   * Move user between groups
   */
  async moveUserBetweenGroups(
    eventId: string,
    dto: MoveUserBetweenGroupsDto,
    adminUserId: string,
  ) {
    return this.manualAssignmentService.moveUserBetweenGroups(
      eventId,
      dto,
      adminUserId,
    );
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(
    eventId: string,
    dto: RemoveUserFromGroupDto,
    adminUserId: string,
  ) {
    return this.manualAssignmentService.removeUserFromGroup(
      eventId,
      dto,
      adminUserId,
    );
  }

  /**
   * Create empty manual group
   */
  async createManualGroup(
    eventId: string,
    dto: CreateManualGroupDto,
    adminUserId: string,
  ) {
    return this.manualAssignmentService.createManualGroup(
      eventId,
      dto,
      adminUserId,
    );
  }

  /**
   * Bulk assign users to group
   */
  async bulkAssignUsers(
    eventId: string,
    dto: BulkAssignUsersDto,
    adminUserId: string,
  ) {
    return this.manualAssignmentService.bulkAssignUsers(
      eventId,
      dto,
      adminUserId,
    );
  }

  // ==================== DELEGATE TO PERSISTENCE SERVICE ====================

  /**
   * Save matching results to database
   */
  async saveMatchingResults(
    eventId: string,
    matchingResult: MatchingResult,
  ): Promise<void> {
    return this.persistenceService.saveMatchingResults(eventId, matchingResult);
  }

  /**
   * Get matching attempt history
   */
  async getMatchingAttemptHistory(eventId: string) {
    return this.persistenceService.getMatchingAttemptHistory(eventId);
  }

  /**
   * Get matching results for an event
   */
  async getMatchingResults(eventId: string) {
    return this.persistenceService.getMatchingResults(eventId);
  }

  /**
   * Get user's matching group for an event
   */
  async getUserMatchingGroup(eventId: string, userId: string) {
    return this.persistenceService.getUserMatchingGroup(eventId, userId);
  }

  // ==================== UTILITY ====================

  /**
   * Utility: Clamp value
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}