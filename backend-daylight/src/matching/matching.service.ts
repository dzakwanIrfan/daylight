import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, TransactionType } from '@prisma/client';
import {
  UserMatchingProfile,
  MatchScore,
  GroupCandidate,
  MatchingResult,
  PersonalityVector,
  MatchingStatus,
} from './types/matching.types';

@Injectable()
export class MatchingService {
  // Multi-pass thresholds - gradually lower requirements
  private readonly THRESHOLDS = [70, 65, 60, 55, 50, 0];
  private readonly MAX_SEED_ATTEMPTS = 10;
  private readonly MIN_GROUP_SIZE = 3;
  private readonly MAX_GROUP_SIZE = 5;

  constructor(private prisma: PrismaService) {}

  /**
   * Main matching function with multi-pass strategy
   */
  async matchEventParticipants(
    eventId: string,
    adminUserId?: string,
  ): Promise<MatchingResult> {
    const startTime = Date.now();

    // 1. Validate event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Get eligible participants
    const participants = await this.getEligibleParticipants(eventId);

    if (participants.length < this.MIN_GROUP_SIZE) {
      const result = this.createEmptyResult(
        eventId,
        participants,
        'Not enough participants. Minimum 3 required.',
      );
      
      // Save attempt even if failed
      await this.saveMatchingAttempt(
        eventId,
        result,
        adminUserId,
        Date.now() - startTime,
      );

      return result;
    }

    // 3. Calculate all pairwise match scores
    const allMatchScores = this.calculateAllMatchScores(participants);

    // 4. Multi-pass matching with different thresholds
    const matchingResult = await this.multiPassMatching(
      eventId,
      participants,
      allMatchScores,
    );

    // 5. Save attempt
    const executionTime = (Date.now() - startTime) / 1000;
    await this.saveMatchingAttempt(
      eventId,
      matchingResult,
      adminUserId,
      executionTime,
    );

    return matchingResult;
  }

  /**
   * Multi-pass matching strategy
   */
  private async multiPassMatching(
    eventId: string,
    participants: UserMatchingProfile[],
    allMatchScores: MatchScore[],
  ): Promise<MatchingResult> {
    const groups: GroupCandidate[] = [];
    const assigned = new Set<string>();
    const warnings: string[] = [];
    const thresholdBreakdown: Map<number, { groups: number; participants: number }> = new Map();

    // Initialize breakdown tracking
    this.THRESHOLDS.forEach(t => thresholdBreakdown.set(t, { groups: 0, participants: 0 }));

    // Try each threshold level
    for (const threshold of this.THRESHOLDS) {
      const remainingParticipants = participants.filter(p => !assigned.has(p.userId));
      
      if (remainingParticipants.length < this.MIN_GROUP_SIZE) {
        break; // Not enough people left
      }

      // Try multiple seed attempts for this threshold
      const thresholdGroups = await this.formGroupsWithThreshold(
        remainingParticipants,
        allMatchScores,
        threshold,
        assigned,
      );

      if (thresholdGroups.length > 0) {
        groups.push(...thresholdGroups);
        
        // Track statistics
        const breakdown = thresholdBreakdown.get(threshold)!;
        breakdown.groups += thresholdGroups.length;
        breakdown.participants += thresholdGroups.reduce((sum, g) => sum + g.size, 0);

        // Mark members as assigned
        thresholdGroups.forEach(group => {
          group.members.forEach(member => assigned.add(member.userId));
        });

        warnings.push(
          `✓ Threshold ${threshold}%: Formed ${thresholdGroups.length} group(s) with ${breakdown.participants} participants`,
        );
      }
    }

    // Identify unmatched users
    const unmatchedUsers = participants.filter(p => !assigned.has(p.userId));

    if (unmatchedUsers.length > 0) {
      warnings.push(
        `⚠ ${unmatchedUsers.length} participant(s) could not be matched even with minimum threshold`,
      );
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(groups, participants.length, unmatchedUsers.length);
    
    // Determine overall status
    let status: MatchingStatus;
    if (groups.length === 0) {
      status = MatchingStatus.NO_MATCH;
      warnings.push('❌ No groups could be formed with any threshold');
    } else if (unmatchedUsers.length > 0) {
      status = MatchingStatus.PARTIALLY_MATCHED;
    } else {
      status = MatchingStatus.MATCHED;
    }

    return {
      eventId,
      totalParticipants: participants.length,
      groups,
      unmatchedUsers,
      statistics,
      thresholdBreakdown: Array.from(thresholdBreakdown.entries())
        .map(([threshold, data]) => ({
          threshold,
          groupsFormed: data.groups,
          participantsMatched: data.participants,
        }))
        .filter(item => item.groupsFormed > 0),
      warnings,
    };
  }

  /**
   * Form groups with specific threshold using multiple seed attempts
   */
  private async formGroupsWithThreshold(
    participants: UserMatchingProfile[],
    allMatchScores: MatchScore[],
    threshold: number,
    globalAssigned: Set<string>,
  ): Promise<GroupCandidate[]> {
    const scoreMap = this.buildScoreMap(allMatchScores);
    const bestGroups: GroupCandidate[] = [];
    let bestCoverage = 0;

    // Try multiple starting seeds
    for (let seedAttempt = 0; seedAttempt < this.MAX_SEED_ATTEMPTS; seedAttempt++) {
      const localAssigned = new Set<string>(globalAssigned);
      const attemptGroups: GroupCandidate[] = [];

      // Get unassigned participants
      const available = participants.filter(p => !localAssigned.has(p.userId));
      
      if (available.length < this.MIN_GROUP_SIZE) {
        break;
      }

      // Start with different seed each attempt
      const seedIndex = seedAttempt % available.length;
      const seedParticipant = available[seedIndex];

      // Try to form group starting from this seed
      const group = this.formSingleGroup(
        seedParticipant,
        available,
        scoreMap,
        threshold,
        localAssigned,
      );

      if (group) {
        attemptGroups.push({ ...group, seedAttempt, thresholdUsed: threshold });
        group.members.forEach(m => localAssigned.add(m.userId));

        // Continue forming more groups from remaining participants
        let continueForming = true;
        while (continueForming) {
          const remaining = available.filter(p => !localAssigned.has(p.userId));
          
          if (remaining.length < this.MIN_GROUP_SIZE) {
            continueForming = false;
            break;
          }

          const nextGroup = this.formSingleGroup(
            remaining[0],
            remaining,
            scoreMap,
            threshold,
            localAssigned,
          );

          if (nextGroup) {
            attemptGroups.push({ ...nextGroup, seedAttempt, thresholdUsed: threshold });
            nextGroup.members.forEach(m => localAssigned.add(m.userId));
          } else {
            continueForming = false;
          }
        }
      }

      // Track best attempt
      const coverage = attemptGroups.reduce((sum, g) => sum + g.size, 0);
      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestGroups.length = 0;
        bestGroups.push(...attemptGroups);
      }

      // If we matched everyone, stop trying
      if (coverage === available.length) {
        break;
      }
    }

    return bestGroups;
  }

  /**
   * Form a single group starting from a seed participant
   */
  private formSingleGroup(
    seed: UserMatchingProfile,
    available: UserMatchingProfile[],
    scoreMap: Map<string, Map<string, MatchScore>>,
    threshold: number,
    assigned: Set<string>,
  ): GroupCandidate | null {
    const group: UserMatchingProfile[] = [seed];
    assigned.add(seed.userId);

    // Find best compatible members
    const candidates = available
      .filter(p => !assigned.has(p.userId))
      .map(p => {
        const avgScore = this.getAverageScoreWithGroup(p, group, scoreMap);
        return { user: p, avgScore };
      })
      .filter(c => c.avgScore >= threshold)
      .sort((a, b) => b.avgScore - a.avgScore);

    // Add members up to MAX_GROUP_SIZE
    for (const candidate of candidates) {
      if (group.length >= this.MAX_GROUP_SIZE) break;

      const avgScore = this.getAverageScoreWithGroup(
        candidate.user,
        group,
        scoreMap,
      );

      if (avgScore >= threshold) {
        group.push(candidate.user);
        assigned.add(candidate.user.userId);
      }
    }

    // Only return group if it meets minimum size
    if (group.length < this.MIN_GROUP_SIZE) {
      // Unassign members
      group.forEach(m => assigned.delete(m.userId));
      return null;
    }

    // Calculate group statistics
    const groupScores = this.getGroupMatchScores(group, scoreMap);
    const avgScore = groupScores.reduce((sum, s) => sum + s.score, 0) / groupScores.length;
    const minScore = Math.min(...groupScores.map(s => s.score));

    return {
      members: group,
      averageMatchScore: Math.round(avgScore * 100) / 100,
      minMatchScore: Math.round(minScore * 100) / 100,
      size: group.length,
      matchScores: groupScores,
      thresholdUsed: threshold,
    };
  }

  /**
   * Save matching results to database (replaces previous results)
   */
  async saveMatchingResults(
    eventId: string,
    matchingResult: MatchingResult,
  ): Promise<void> {
    // Delete existing matching groups for this event
    await this.prisma.matchingGroup.deleteMany({
      where: { eventId },
    });

    // Determine overall status
    let status: MatchingStatus;
    if (matchingResult.groups.length === 0) {
      status = MatchingStatus.NO_MATCH;
    } else if (matchingResult.unmatchedUsers.length > 0) {
      status = MatchingStatus.PARTIALLY_MATCHED;
    } else {
      status = MatchingStatus.MATCHED;
    }

    // Create new matching groups
    for (let i = 0; i < matchingResult.groups.length; i++) {
      const group = matchingResult.groups[i];

      await this.prisma.matchingGroup.create({
        data: {
          eventId,
          groupNumber: i + 1,
          status,
          averageMatchScore: group.averageMatchScore,
          minMatchScore: group.minMatchScore,
          groupSize: group.size,
          thresholdUsed: group.thresholdUsed,
          members: {
            create: group.members.map((member) => {
              const memberMatchScores: Record<string, number> = {};
              group.matchScores.forEach((score) => {
                if (score.userId1 === member.userId) {
                  memberMatchScores[score.userId2] = score.score;
                } else if (score.userId2 === member.userId) {
                  memberMatchScores[score.userId1] = score.score;
                }
              });

              return {
                userId: member.userId,
                transactionId: member.transactionId,
                matchScores: memberMatchScores,
                personalitySnapshot: {
                  energyScore: member.energyScore,
                  opennessScore: member.opennessScore,
                  structureScore: member.structureScore,
                  affectScore: member.affectScore,
                  comfortScore: member.comfortScore,
                  lifestyleScore: member.lifestyleScore,
                  rawScores: member.rawScores,
                },
              };
            }),
          },
        },
      });
    }
  }

  /**
   * Save matching attempt for history/transparency
   */
  private async saveMatchingAttempt(
    eventId: string,
    result: MatchingResult,
    adminUserId: string | undefined,
    executionTime: number,
  ): Promise<void> {
    // Get attempt number
    const lastAttempt = await this.prisma.matchingAttempt.findFirst({
      where: { eventId },
      orderBy: { attemptNumber: 'desc' },
      select: { attemptNumber: true },
    });

    const attemptNumber = (lastAttempt?.attemptNumber || 0) + 1;

    // Determine status
    let status: MatchingStatus;
    if (result.groups.length === 0) {
      status = MatchingStatus.NO_MATCH;
    } else if (result.unmatchedUsers.length > 0) {
      status = MatchingStatus.PARTIALLY_MATCHED;
    } else {
      status = MatchingStatus.MATCHED;
    }

    await this.prisma.matchingAttempt.create({
      data: {
        eventId,
        attemptNumber,
        status,
        totalParticipants: result.totalParticipants,
        matchedCount: result.statistics.matchedCount,
        unmatchedCount: result.statistics.unmatchedCount,
        groupsFormed: result.statistics.totalGroups,
        averageMatchScore: result.statistics.averageMatchScore || null,
        highestThreshold: result.statistics.highestThreshold,
        lowestThreshold: result.statistics.lowestThreshold,
        matchingResult: result as any,
        unmatchedUsers: result.unmatchedUsers as any,
        executedBy: adminUserId || null,
        executionTime,
      },
    });
  }

  /**
   * Get matching attempt history
   */
  async getMatchingAttemptHistory(eventId: string) {
    return this.prisma.matchingAttempt.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Build score map for quick lookup
   */
  private buildScoreMap(
    matchScores: MatchScore[],
  ): Map<string, Map<string, MatchScore>> {
    const map = new Map<string, Map<string, MatchScore>>();

    matchScores.forEach((score) => {
      if (!map.has(score.userId1)) {
        map.set(score.userId1, new Map());
      }
      if (!map.has(score.userId2)) {
        map.set(score.userId2, new Map());
      }
      map.get(score.userId1)!.set(score.userId2, score);
      map.get(score.userId2)!.set(score.userId1, score);
    });

    return map;
  }

  /**
   * Create empty result for edge cases
   */
  private createEmptyResult(
    eventId: string,
    participants: UserMatchingProfile[],
    warning: string,
  ): MatchingResult {
    return {
      eventId,
      totalParticipants: participants.length,
      groups: [],
      unmatchedUsers: participants,
      statistics: {
        totalGroups: 0,
        averageGroupSize: 0,
        averageMatchScore: 0,
        matchedCount: 0,
        unmatchedCount: participants.length,
        highestThreshold: 0,
        lowestThreshold: 0,
      },
      thresholdBreakdown: [],
      warnings: [warning],
    };
  }

  /**
   * Calculate enhanced statistics
   */
  private calculateStatistics(
    groups: GroupCandidate[],
    totalParticipants: number,
    unmatchedCount: number,
  ) {
    const totalGroups = groups.length;
    const matchedCount = totalParticipants - unmatchedCount;
    const averageGroupSize = totalGroups > 0 ? matchedCount / totalGroups : 0;
    const averageMatchScore =
      totalGroups > 0
        ? groups.reduce((sum, g) => sum + g.averageMatchScore, 0) / totalGroups
        : 0;

    const thresholds = groups.map(g => g.thresholdUsed);
    const highestThreshold = thresholds.length > 0 ? Math.max(...thresholds) : 0;
    const lowestThreshold = thresholds.length > 0 ? Math.min(...thresholds) : 0;

    return {
      totalGroups,
      averageGroupSize: Math.round(averageGroupSize * 100) / 100,
      averageMatchScore: Math.round(averageMatchScore * 100) / 100,
      matchedCount,
      unmatchedCount,
      highestThreshold,
      lowestThreshold,
    };
  }

  /**
   * Get eligible participants (paid + has personality result)
   */
  private async getEligibleParticipants(
    eventId: string,
  ): Promise<UserMatchingProfile[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        eventId,
        paymentStatus: PaymentStatus.PAID,
        transactionType: TransactionType.EVENT,
        user: {
          personalityResult: {
            isNot: null,
          },
        },
      },
      include: {
        user: {
          include: {
            personalityResult: true,
          },
        },
      },
    });

    return transactions
      .filter((t) => t.user.personalityResult !== null)
      .map((t) => {
        const pr = t.user.personalityResult!;

        return {
          userId: t.userId,
          transactionId: t.id,
          email: t.user.email,
          name: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.customerName,
          
          energyScore: pr.energyScore,
          opennessScore: pr.opennessScore,
          structureScore: pr.structureScore,
          affectScore: pr.affectScore,
          comfortScore: pr.comfortScore,
          lifestyleScore: pr.lifestyleScore,
          
          rawScores: {
            E: pr.energyRaw,
            O: pr.opennessRaw,
            S: pr.structureRaw,
            A: pr.affectRaw,
            L: pr.lifestyleRaw,
            C: pr.comfortRaw,
          },
          
          relationshipStatus: pr.relationshipStatus,
          genderMixComfort: pr.genderMixComfort,
          intentOnDaylight: (pr.intentOnDaylight as string[]) || [],
        };
      });
  }

  /**
   * Calculate match score between two users
   */
  private calculateMatchScore(
    user1: UserMatchingProfile,
    user2: UserMatchingProfile,
  ): MatchScore {
    // 1. Cosine similarity on [E, O, S, A]
    const v1: PersonalityVector = {
      E: user1.rawScores.E,
      O: user1.rawScores.O,
      S: user1.rawScores.S,
      A: user1.rawScores.A,
    };

    const v2: PersonalityVector = {
      E: user2.rawScores.E,
      O: user2.rawScores.O,
      S: user2.rawScores.S,
      A: user2.rawScores.A,
    };

    const cosineSim = this.cosineSimilarity(v1, v2);
    const cosineScore = ((cosineSim + 1) / 2) * 100;

    // 2. Lifestyle bonus (0-20)
    const L_gap = Math.abs(user1.lifestyleScore - user2.lifestyleScore);
    const lifestyleBonus = Math.max(0, 20 - L_gap);

    // 3. Comfort bonus (0-20)
    const C_min = Math.min(user1.comfortScore, user2.comfortScore);
    const comfortBonus = 0.2 * C_min;

    // 4. Final score
    const finalScore =
      0.7 * cosineScore + 0.15 * lifestyleBonus + 0.15 * comfortBonus;

    return {
      userId1: user1.userId,
      userId2: user2.userId,
      score: Math.round(finalScore * 100) / 100,
      breakdown: {
        cosineSimilarity: Math.round(cosineScore * 100) / 100,
        lifestyleBonus: Math.round(lifestyleBonus * 100) / 100,
        comfortBonus: Math.round(comfortBonus * 100) / 100,
      },
    };
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(v1: PersonalityVector, v2: PersonalityVector): number {
    const dotProduct = v1.E * v2.E + v1.O * v2.O + v1.S * v2.S + v1.A * v2.A;
    
    const magnitude1 = Math.sqrt(
      v1.E ** 2 + v1.O ** 2 + v1.S ** 2 + v1.A ** 2,
    );
    
    const magnitude2 = Math.sqrt(
      v2.E ** 2 + v2.O ** 2 + v2.S ** 2 + v2.A ** 2,
    );

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate all pairwise match scores
   */
  private calculateAllMatchScores(
    participants: UserMatchingProfile[],
  ): MatchScore[] {
    const scores: MatchScore[] = [];

    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const score = this.calculateMatchScore(participants[i], participants[j]);
        scores.push(score);
      }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores;
  }

  /**
   * Get average match score with group members
   */
  private getAverageScoreWithGroup(
    user: UserMatchingProfile,
    group: UserMatchingProfile[],
    scoreMap: Map<string, Map<string, MatchScore>>,
  ): number {
    const scores = group.map((member) => {
      const score =
        scoreMap.get(user.userId)?.get(member.userId) ||
        scoreMap.get(member.userId)?.get(user.userId);
      return score?.score || 0;
    });

    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  /**
   * Get all pairwise match scores within a group
   */
  private getGroupMatchScores(
    group: UserMatchingProfile[],
    scoreMap: Map<string, Map<string, MatchScore>>,
  ): MatchScore[] {
    const scores: MatchScore[] = [];

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const score =
          scoreMap.get(group[i].userId)?.get(group[j].userId) ||
          scoreMap.get(group[j].userId)?.get(group[i].userId);
        
        if (score) {
          scores.push(score);
        }
      }
    }

    return scores;
  }

  /**
   * Get matching results for an event
   */
  async getMatchingResults(eventId: string) {
    const groups = await this.prisma.matchingGroup.findMany({
      where: { eventId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                personalityResult: {
                  select: {
                    archetype: true,
                    profileScore: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { groupNumber: 'asc' },
    });

    return groups.map((group) => ({
      id: group.id,
      groupNumber: group.groupNumber,
      status: group.status,
      averageMatchScore: group.averageMatchScore,
      minMatchScore: group.minMatchScore,
      groupSize: group.groupSize,
      thresholdUsed: group.thresholdUsed,
      tableNumber: group.tableNumber,
      venueName: group.venueName,
      members: group.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        user: {
          email: member.user.email,
          name: `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
          profilePicture: member.user.profilePicture,
          archetype: member.user.personalityResult?.archetype,
          profileScore: member.user.personalityResult?.profileScore,
        },
        matchScores: member.matchScores,
        personalitySnapshot: member.personalitySnapshot,
        isConfirmed: member.isConfirmed,
      })),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));
  }

  /**
   * Get user's matching group for an event
   */
  async getUserMatchingGroup(eventId: string, userId: string) {
    const member = await this.prisma.matchingMember.findFirst({
      where: {
        userId,
        group: {
          eventId,
        },
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    personalityResult: {
                      select: {
                        archetype: true,
                        profileScore: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('No matching group found for this user');
    }

    return {
      groupId: member.group.id,
      groupNumber: member.group.groupNumber,
      status: member.group.status,
      averageMatchScore: member.group.averageMatchScore,
      minMatchScore: member.group.minMatchScore,
      groupSize: member.group.groupSize,
      thresholdUsed: member.group.thresholdUsed,
      tableNumber: member.group.tableNumber,
      venueName: member.group.venueName,
      isConfirmed: member.isConfirmed,
      members: member.group.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        isYou: m.userId === userId,
        user: {
          email: m.user.email,
          name: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim(),
          profilePicture: m.user.profilePicture,
          archetype: m.user.personalityResult?.archetype,
          profileScore: m.user.personalityResult?.profileScore,
        },
        matchScores: m.matchScores,
        personalitySnapshot: m.personalitySnapshot,
        isConfirmed: m.isConfirmed,
      })),
    };
  }

  /**
   * Utility: Clamp value
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}