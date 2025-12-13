import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Feedback Validation Service
 * Handles all validation logic for feedback operations
 */
@Injectable()
export class FeedbackValidationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Validate if user can give feedback to target user
     */
    async validateFeedbackEligibility(
        reviewerId: string,
        targetUserId: string,
        eventId: string,
        groupId?: string,
    ): Promise<void> {
        // 1. Check if reviewer and target are the same
        if (reviewerId === targetUserId) {
            throw new BadRequestException('You cannot review yourself');
        }

        // 2. Check if event exists and is completed
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const eventEndTime = new Date(event.endTime);
        const now = new Date();

        if (eventEndTime > now) {
            throw new BadRequestException(
                'You can only submit feedback after the event has ended',
            );
        }

        // 3. Check if both users were in the same group for this event
        const [reviewerMember, targetMember] = await Promise.all([
            this.prisma.matchingMember.findFirst({
                where: {
                    userId: reviewerId,
                    group: { eventId },
                },
                include: { group: true },
            }),
            this.prisma.matchingMember.findFirst({
                where: {
                    userId: targetUserId,
                    group: { eventId },
                },
                include: { group: true },
            }),
        ]);

        if (!reviewerMember) {
            throw new ForbiddenException('You were not a participant in this event');
        }

        if (!targetMember) {
            throw new NotFoundException('Target user was not a participant in this event');
        }

        if (reviewerMember.groupId !== targetMember.groupId) {
            throw new ForbiddenException(
                'You can only review users who were in your group',
            );
        }

        // 4. If groupId provided, validate it matches
        if (groupId && groupId !== reviewerMember.groupId) {
            throw new BadRequestException('Invalid group ID');
        }

        // 5. Check if feedback already exists
        const existingFeedback = await this.prisma.userFeedback.findUnique({
            where: {
                reviewerId_targetUserId_eventId: {
                    reviewerId,
                    targetUserId,
                    eventId,
                },
            },
        });

        if (existingFeedback) {
            throw new BadRequestException(
                'You have already submitted feedback for this user in this event',
            );
        }
    }

    /**
     * Validate feedback ownership for updates
     */
    async validateFeedbackOwnership(
        feedbackId: string,
        userId: string,
    ): Promise<void> {
        const feedback = await this.prisma.userFeedback.findUnique({
            where: { id: feedbackId },
        });

        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }

        if (feedback.reviewerId !== userId) {
            throw new ForbiddenException('You can only update your own feedback');
        }
    }

    /**
     * Get pending feedback targets for a user in an event
     */
    async getPendingFeedbackTargets(userId: string, eventId: string) {
        // Get user's group members
        const userMember = await this.prisma.matchingMember.findFirst({
            where: {
                userId,
                group: { eventId },
            },
            include: {
                group: {
                    include: {
                        members: {
                            where: {
                                userId: { not: userId },
                            },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        firstName: true,
                                        lastName: true,
                                        profilePicture: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!userMember) {
            return [];
        }

        // Get already submitted feedbacks
        const submittedFeedbacks = await this.prisma.userFeedback.findMany({
            where: {
                reviewerId: userId,
                eventId,
            },
            select: {
                targetUserId: true,
            },
        });

        const submittedUserIds = new Set(
            submittedFeedbacks.map((f) => f.targetUserId),
        );

        // Filter out users who already received feedback
        const pendingTargets = userMember.group.members
            .filter((member) => !submittedUserIds.has(member.userId))
            .map((member) => ({
                userId: member.user.id,
                email: member.user.email,
                name: `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim(),
                profilePicture: member.user.profilePicture,
            }));

        return pendingTargets;
    }
}