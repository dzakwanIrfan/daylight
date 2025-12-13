import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { GetFeedbacksDto } from './dto/get-feedbacks.dto';
import { FeedbackValidationService } from './services/feedback-validation.service';
import { FeedbackStatisticsService } from './services/feedback-statistics.service';

/**
 * Feedback Service (Orchestrator)
 * Coordinates feedback operations and delegates to specialized services
 */
@Injectable()
export class FeedbackService {
    constructor(
        private prisma: PrismaService,
        private validationService: FeedbackValidationService,
        private statisticsService: FeedbackStatisticsService,
    ) { }

    /**
     * Create new feedback
     */
    async createFeedback(reviewerId: string, dto: CreateFeedbackDto) {
        // Validate eligibility
        await this.validationService.validateFeedbackEligibility(
            reviewerId,
            dto.targetUserId,
            dto.eventId,
            dto.groupId,
        );

        // Get the actual group ID if not provided
        let groupId = dto.groupId;
        if (!groupId) {
            const member = await this.prisma.matchingMember.findFirst({
                where: {
                    userId: reviewerId,
                    group: { eventId: dto.eventId },
                },
            });
            groupId = member?.groupId;
        }

        // Create feedback
        const feedback = await this.prisma.userFeedback.create({
            data: {
                reviewerId,
                targetUserId: dto.targetUserId,
                eventId: dto.eventId,
                groupId,
                rating: dto.rating,
                review: dto.review,
            },
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
                    },
                },
            },
        });

        return {
            message: 'Feedback submitted successfully',
            feedback,
        };
    }

    /**
     * Update existing feedback
     */
    async updateFeedback(
        feedbackId: string,
        userId: string,
        dto: UpdateFeedbackDto,
    ) {
        // Validate ownership
        await this.validationService.validateFeedbackOwnership(feedbackId, userId);

        // Update feedback
        const feedback = await this.prisma.userFeedback.update({
            where: { id: feedbackId },
            data: {
                rating: dto.rating,
                review: dto.review,
            },
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
            },
        });

        return {
            message: 'Feedback updated successfully',
            feedback,
        };
    }

    /**
     * Delete feedback
     */
    async deleteFeedback(feedbackId: string, userId: string) {
        // Validate ownership
        await this.validationService.validateFeedbackOwnership(feedbackId, userId);

        await this.prisma.userFeedback.delete({
            where: { id: feedbackId },
        });

        return {
            message: 'Feedback deleted successfully',
        };
    }

    /**
     * Get feedbacks with filters and pagination
     */
    async getFeedbacks(dto: GetFeedbacksDto) {
        const { targetUserId, eventId, page = 1, limit = 10 } = dto;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (targetUserId) where.targetUserId = targetUserId;
        if (eventId) where.eventId = eventId;

        const [feedbacks, total] = await Promise.all([
            this.prisma.userFeedback.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                        },
                    },
                },
            }),
            this.prisma.userFeedback.count({ where }),
        ]);

        return {
            feedbacks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get feedback by ID
     */
    async getFeedbackById(feedbackId: string) {
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
                    },
                },
                group: {
                    select: {
                        id: true,
                        groupNumber: true,
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
     * Get user's received feedbacks
     */
    async getReceivedFeedbacks(userId: string, page = 1, limit = 10) {
        return this.getFeedbacks({
            targetUserId: userId,
            page,
            limit,
        });
    }

    /**
     * Get user's given feedbacks
     */
    async getGivenFeedbacks(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [feedbacks, total] = await Promise.all([
            this.prisma.userFeedback.findMany({
                where: { reviewerId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
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
                        },
                    },
                },
            }),
            this.prisma.userFeedback.count({ where: { reviewerId: userId } }),
        ]);

        return {
            feedbacks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get pending feedback targets for user in an event
     */
    async getPendingFeedbacks(userId: string, eventId: string) {
        const pendingTargets =
            await this.validationService.getPendingFeedbackTargets(userId, eventId);

        return {
            eventId,
            pendingCount: pendingTargets.length,
            targets: pendingTargets,
        };
    }

    /**
     * Get user rating statistics
     */
    async getUserRatingStats(userId: string) {
        return this.statisticsService.calculateUserAverageRating(userId);
    }

    /**
     * Get event feedback statistics
     */
    async getEventFeedbackStats(eventId: string) {
        return this.statisticsService.getEventFeedbackStats(eventId);
    }

    /**
     * Get group feedback completion status
     */
    async getGroupFeedbackStatus(groupId: string) {
        const status =
            await this.statisticsService.getGroupFeedbackStatus(groupId);

        if (!status) {
            throw new NotFoundException('Group not found');
        }

        return status;
    }
}