import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryFeedbackAdminDto } from '../dto/query-feedback-admin.dto';
import {
    BulkActionFeedbackDto,
    FeedbackBulkActionType,
} from '../dto/bulk-action-feedback.dto';

/**
 * Feedback Admin Service
 * Handles all admin-specific feedback operations
 */
@Injectable()
export class FeedbackAdminService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all feedbacks with advanced filters (Admin)
     */
    async getFeedbackAll(queryDto: QueryFeedbackAdminDto) {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            eventId,
            reviewerId,
            targetUserId,
            groupId,
            minRating,
            maxRating,
        } = queryDto;

        const where: Prisma.UserFeedbackWhereInput = {};

        // Search across review text and user names
        if (search) {
            where.OR = [
                { review: { contains: search, mode: 'insensitive' } },
                {
                    reviewer: {
                        OR: [
                            { email: { contains: search, mode: 'insensitive' } },
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    targetUser: {
                        OR: [
                            { email: { contains: search, mode: 'insensitive' } },
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    event: {
                        title: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }

        // Filters
        if (eventId) where.eventId = eventId;
        if (reviewerId) where.reviewerId = reviewerId;
        if (targetUserId) where.targetUserId = targetUserId;
        if (groupId) where.groupId = groupId;

        // Rating range filter
        if (minRating !== undefined || maxRating !== undefined) {
            where.rating = {};
            if (minRating !== undefined) where.rating.gte = minRating;
            if (maxRating !== undefined) where.rating.lte = maxRating;
        }

        // Pagination
        const skip = (page - 1) * limit;
        const take = limit;

        // Execute query
        const [feedbacks, total] = await Promise.all([
            this.prisma.userFeedback.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                    targetUser: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                    event: {
                        select: {
                            id: true,
                            title: true,
                            eventDate: true,
                            category: true,
                        },
                    },
                    group: {
                        select: {
                            id: true,
                            groupNumber: true,
                        },
                    },
                },
            }),
            this.prisma.userFeedback.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: feedbacks,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage,
                hasPrevPage,
            },
            filters: {
                eventId,
                reviewerId,
                targetUserId,
                groupId,
                minRating,
                maxRating,
            },
            sorting: {
                sortBy,
                sortOrder,
            },
        };
    }

    /**
     * Get feedback by ID (Admin)
     */
    async getFeedbackByIdAdmin(feedbackId: string) {
        const feedback = await this.prisma.userFeedback.findUnique({
            where: { id: feedbackId },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true,
                    },
                },
                targetUser: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        eventDate: true,
                        category: true,
                        status: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        groupNumber: true,
                        groupSize: true,
                        averageMatchScore: true,
                    },
                },
            },
        });

        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }

        return feedback;
    }

    /**
     * Delete feedback (Admin)
     */
    async deleteFeedbackAdmin(feedbackId: string) {
        const feedback = await this.prisma.userFeedback.findUnique({
            where: { id: feedbackId },
        });

        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }

        await this.prisma.userFeedback.delete({
            where: { id: feedbackId },
        });

        return {
            message: 'Feedback deleted successfully',
        };
    }

    /**
     * Bulk action on feedbacks (Admin)
     */
    async bulkAction(bulkActionDto: BulkActionFeedbackDto) {
        const { feedbackIds, action } = bulkActionDto;

        // Validate feedback IDs
        const feedbacks = await this.prisma.userFeedback.findMany({
            where: { id: { in: feedbackIds } },
        });

        if (feedbacks.length !== feedbackIds.length) {
            throw new BadRequestException('Some feedback IDs are invalid');
        }

        let result;

        switch (action) {
            case FeedbackBulkActionType.DELETE:
                result = await this.prisma.userFeedback.deleteMany({
                    where: { id: { in: feedbackIds } },
                });
                break;

            case FeedbackBulkActionType.EXPORT:
                // Return the feedbacks for export
                const exportData = await this.prisma.userFeedback.findMany({
                    where: { id: { in: feedbackIds } },
                    include: {
                        reviewer: {
                            select: {
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        targetUser: {
                            select: {
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        event: {
                            select: {
                                title: true,
                                eventDate: true,
                            },
                        },
                        group: {
                            select: {
                                groupNumber: true,
                            },
                        },
                    },
                });
                return {
                    message: 'Export data prepared',
                    data: exportData,
                };

            default:
                throw new BadRequestException('Invalid bulk action');
        }

        return {
            message: `Bulk action ${action} completed successfully`,
            affectedCount: result.count,
        };
    }

    /**
     * Export feedbacks with filters (Admin)
     */
    async exportFeedbacks(queryDto: QueryFeedbackAdminDto) {
        const {
            search,
            eventId,
            reviewerId,
            targetUserId,
            groupId,
            minRating,
            maxRating,
        } = queryDto;

        const where: Prisma.UserFeedbackWhereInput = {};

        // Search
        if (search) {
            where.OR = [
                { review: { contains: search, mode: 'insensitive' } },
                {
                    reviewer: {
                        OR: [
                            { email: { contains: search, mode: 'insensitive' } },
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    targetUser: {
                        OR: [
                            { email: { contains: search, mode: 'insensitive' } },
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    event: {
                        title: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }

        // Filters
        if (eventId) where.eventId = eventId;
        if (reviewerId) where.reviewerId = reviewerId;
        if (targetUserId) where.targetUserId = targetUserId;
        if (groupId) where.groupId = groupId;

        // Rating range
        if (minRating !== undefined || maxRating !== undefined) {
            where.rating = {};
            if (minRating !== undefined) where.rating.gte = minRating;
            if (maxRating !== undefined) where.rating.lte = maxRating;
        }

        const feedbacks = await this.prisma.userFeedback.findMany({
            where,
            include: {
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                targetUser: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        eventDate: true,
                        category: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        groupNumber: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return feedbacks;
    }

    /**
     * Get feedback statistics overview (Admin Dashboard)
     */
    async getFeedbackOverviewStats() {
        const [
            totalFeedbacks,
            avgRating,
            ratingDistribution,
            recentFeedbacks,
            topRatedUsers,
        ] = await Promise.all([
            // Total feedbacks
            this.prisma.userFeedback.count(),

            // Average rating
            this.prisma.userFeedback.aggregate({
                _avg: { rating: true },
            }),

            // Rating distribution
            this.prisma.userFeedback.groupBy({
                by: ['rating'],
                _count: { rating: true },
            }),

            // Recent feedbacks (last 7 days)
            this.prisma.userFeedback.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),

            // Top rated users (average rating >= 4.5, min 3 reviews)
            this.prisma.$queryRaw`
        SELECT 
          u.id,
          u.email,
          u."firstName",
          u."lastName",
          u."profilePicture",
          COUNT(uf.id)::int as "totalReviews",
          ROUND(AVG(uf.rating)::numeric, 2) as "averageRating"
        FROM "User" u
        INNER JOIN "UserFeedback" uf ON u.id = uf."targetUserId"
        GROUP BY u.id, u.email, u."firstName", u."lastName", u."profilePicture"
        HAVING COUNT(uf.id) >= 3 AND AVG(uf.rating) >= 4.5
        ORDER BY AVG(uf.rating) DESC, COUNT(uf.id) DESC
        LIMIT 10
      `,
        ]);

        const ratingDistMap = ratingDistribution.reduce(
            (acc, item) => {
                acc[item.rating] = item._count.rating;
                return acc;
            },
            { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        );

        return {
            totalFeedbacks,
            averageRating: avgRating._avg.rating
                ? Math.round(avgRating._avg.rating * 100) / 100
                : 0,
            ratingDistribution: ratingDistMap,
            recentFeedbacks,
            topRatedUsers,
        };
    }

    /**
     * Get event-specific feedback analytics (Admin)
     */
    async getEventFeedbackAnalytics(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const [
            feedbacks,
            groups,
            avgRating,
            ratingDistribution,
        ] = await Promise.all([
            this.prisma.userFeedback.findMany({
                where: { eventId },
                select: {
                    rating: true,
                    reviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    targetUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),

            this.prisma.matchingGroup.findMany({
                where: { eventId },
                select: {
                    id: true,
                    groupNumber: true,
                    groupSize: true,
                    _count: {
                        select: { userFeedbacks: true },
                    },
                },
            }),

            this.prisma.userFeedback.aggregate({
                where: { eventId },
                _avg: { rating: true },
            }),

            this.prisma.userFeedback.groupBy({
                where: { eventId },
                by: ['rating'],
                _count: { rating: true },
            }),
        ]);

        const totalFeedbacks = feedbacks.length;
        const totalParticipants = groups.reduce((sum, g) => sum + g.groupSize, 0);
        const maxPossibleFeedbacks = groups.reduce(
            (sum, g) => sum + g.groupSize * (g.groupSize - 1),
            0,
        );

        const completionRate =
            maxPossibleFeedbacks > 0
                ? (totalFeedbacks / maxPossibleFeedbacks) * 100
                : 0;

        const ratingDistMap = ratingDistribution.reduce(
            (acc, item) => {
                acc[item.rating] = item._count.rating;
                return acc;
            },
            { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        );

        const groupStats = groups.map((group) => ({
            groupId: group.id,
            groupNumber: group.groupNumber,
            groupSize: group.groupSize,
            feedbacksSubmitted: group._count.userFeedbacks,
            maxPossibleFeedbacks: group.groupSize * (group.groupSize - 1),
            completionRate:
                group.groupSize > 1
                    ? (group._count.userFeedbacks /
                        (group.groupSize * (group.groupSize - 1))) *
                    100
                    : 0,
        }));

        return {
            eventId,
            eventTitle: event.title,
            eventDate: event.eventDate,
            totalFeedbacks,
            totalParticipants,
            maxPossibleFeedbacks,
            completionRate: Math.round(completionRate * 100) / 100,
            averageRating: avgRating._avg.rating
                ? Math.round(avgRating._avg.rating * 100) / 100
                : 0,
            ratingDistribution: ratingDistMap,
            groupStats,
        };
    }
}