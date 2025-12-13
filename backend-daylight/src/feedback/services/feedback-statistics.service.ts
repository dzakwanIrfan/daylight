import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Feedback Statistics Service
 * Handles calculation of feedback statistics and aggregations
 */
@Injectable()
export class FeedbackStatisticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate user's average rating
     */
    async calculateUserAverageRating(userId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<number, number>;
    }> {
        const feedbacks = await this.prisma.userFeedback.findMany({
            where: { targetUserId: userId },
            select: { rating: true },
        });

        if (feedbacks.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
        }

        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRating / feedbacks.length;

        // Calculate rating distribution
        const ratingDistribution = feedbacks.reduce(
            (dist, f) => {
                dist[f.rating] = (dist[f.rating] || 0) + 1;
                return dist;
            },
            { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        );

        return {
            averageRating: Math.round(averageRating * 100) / 100,
            totalReviews: feedbacks.length,
            ratingDistribution,
        };
    }

    /**
     * Get event feedback statistics
     */
    async getEventFeedbackStats(eventId: string) {
        const feedbacks = await this.prisma.userFeedback.findMany({
            where: { eventId },
            select: { rating: true },
        });

        const totalFeedbacks = feedbacks.length;
        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating =
            totalFeedbacks > 0 ? totalRating / totalFeedbacks : 0;

        // Get participants count
        const participants = await this.prisma.matchingMember.count({
            where: { group: { eventId } },
        });

        // Calculate potential feedbacks (each participant can review others in their group)
        const groups = await this.prisma.matchingGroup.findMany({
            where: { eventId },
            select: { groupSize: true },
        });

        const maxPossibleFeedbacks = groups.reduce(
            (sum, g) => sum + g.groupSize * (g.groupSize - 1),
            0,
        );

        const completionRate =
            maxPossibleFeedbacks > 0
                ? (totalFeedbacks / maxPossibleFeedbacks) * 100
                : 0;

        return {
            totalFeedbacks,
            averageRating: Math.round(averageRating * 100) / 100,
            participants,
            maxPossibleFeedbacks,
            completionRate: Math.round(completionRate * 100) / 100,
        };
    }

    /**
     * Get group feedback completion status
     */
    async getGroupFeedbackStatus(groupId: string) {
        const group = await this.prisma.matchingGroup.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    select: { userId: true },
                },
                userFeedbacks: {
                    select: {
                        reviewerId: true,
                        targetUserId: true,
                    },
                },
            },
        });

        if (!group) {
            return null;
        }

        const memberIds = group.members.map((m) => m.userId);
        const totalMembers = memberIds.length;
        const maxFeedbacks = totalMembers * (totalMembers - 1);
        const submittedFeedbacks = group.userFeedbacks.length;

        // Calculate per-user completion
        const memberCompletion = memberIds.map((userId) => {
            const expectedFeedbacks = totalMembers - 1; // Review all except self
            const submittedByUser = group.userFeedbacks.filter(
                (f) => f.reviewerId === userId,
            ).length;

            return {
                userId,
                submitted: submittedByUser,
                expected: expectedFeedbacks,
                completed: submittedByUser === expectedFeedbacks,
            };
        });

        return {
            groupId,
            totalMembers,
            maxFeedbacks,
            submittedFeedbacks,
            completionRate:
                maxFeedbacks > 0
                    ? Math.round((submittedFeedbacks / maxFeedbacks) * 100 * 100) / 100
                    : 0,
            memberCompletion,
        };
    }
}