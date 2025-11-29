import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchingResult, MatchingStatus } from '../types/matching.types';

/**
 * Matching Persistence Service
 * Handles database operations for matching results
 */
@Injectable()
export class MatchingPersistenceService {
    constructor(private prisma: PrismaService) { }

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
    async saveMatchingAttempt(
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
                                        energyScore: true,
                                        opennessScore: true,
                                        structureScore: true,
                                        affectScore: true,
                                        lifestyleScore: true,
                                        comfortScore: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { groupNumber: 'asc' },
        });

        return groups;
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
            throw new NotFoundException(
                'You are not assigned to any group for this event',
            );
        }

        return {
            group: member.group,
            yourMatchScores: member.matchScores,
            personalitySnapshot: member.personalitySnapshot,
        };
    }
}
