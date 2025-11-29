import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    UserMatchingProfile,
    GroupCandidate,
    MatchingResult,
} from '../types/matching.types';

/**
 * Statistics Service  
 * Handles calculation of matching and group statistics
 */
@Injectable()
export class StatisticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate enhanced statistics
     */
    calculateStatistics(
        groups: GroupCandidate[],
        totalParticipants: number,
        unmatchedCount: number,
    ) {
        const totalGroups = groups.length;
        const matchedCount = totalParticipants - unmatchedCount;

        const averageGroupSize =
            totalGroups > 0
                ? groups.reduce((sum, g) => sum + g.size, 0) / totalGroups
                : 0;

        const allScores = groups.flatMap((g) => g.matchScores.map((s) => s.score));
        const averageMatchScore =
            allScores.length > 0
                ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
                : 0;

        const thresholds = groups.map((g) => g.thresholdUsed);
        const highestThreshold = thresholds.length > 0 ? Math.max(...thresholds) : 0;
        const lowestThreshold = thresholds.length > 0 ? Math.min(...thresholds) : 0;

        return {
            averageGroupSize: Math.round(averageGroupSize * 100) / 100,
            averageMatchScore: Math.round(averageMatchScore * 100) / 100,
            totalGroups,
            matchedCount,
            unmatchedCount,
            highestThreshold,
            lowestThreshold,
        };
    }

    /**
     * Create empty result for edge cases
     */
    createEmptyResult(
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
                averageGroupSize: 0,
                averageMatchScore: 0,
                totalGroups: 0,
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
     * Recalculate group statistics after manual changes
     */
    async recalculateGroupStatistics(
        groupId: string,
        adminUserId: string,
    ): Promise<void> {
        const group = await this.prisma.matchingGroup.findUnique({
            where: { id: groupId },
            include: { members: true },
        });

        if (!group || group.members.length === 0) {
            return;
        }

        // Collect all match scores
        const allScores: number[] = [];
        for (const member of group.members) {
            const scores = Object.values(
                member.matchScores as Record<string, number>,
            );
            allScores.push(...scores);
        }

        const averageMatchScore =
            allScores.length > 0
                ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
                : 0;
        const minMatchScore = allScores.length > 0 ? Math.min(...allScores) : 0;

        await this.prisma.matchingGroup.update({
            where: { id: groupId },
            data: {
                groupSize: group.members.length,
                averageMatchScore: Math.round(averageMatchScore * 100) / 100,
                minMatchScore: Math.round(minMatchScore * 100) / 100,
                hasManualChanges: true,
                lastModifiedBy: adminUserId,
                lastModifiedAt: new Date(),
            },
        });
    }
}
