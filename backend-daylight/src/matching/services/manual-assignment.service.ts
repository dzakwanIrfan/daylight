import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchingStatus } from '../types/matching.types';
import { MATCHING_CONSTANTS } from '../matching.constants';
import {
    AssignUserToGroupDto,
    BulkAssignUsersDto,
    CreateManualGroupDto,
    MoveUserBetweenGroupsDto,
    RemoveUserFromGroupDto,
} from '../dto/manual-assignment.dto';
import { ScoreCalculationService } from './score-calculation.service';
import { StatisticsService } from './statistics.service';
import {
    validateUserEligibility,
    validateGroupSize,
} from '../helpers/validation.helper';
import { mapTransactionToUserProfile, mapMemberToUserProfile } from '../helpers/user-profile.mapper';

/**
 * Manual Assignment Service
 * Handles all manual group assignment operations
 */
@Injectable()
export class ManualAssignmentService {
    constructor(
        private prisma: PrismaService,
        private scoreService: ScoreCalculationService,
        private statisticsService: StatisticsService,
    ) { }

    /**
     * Manually assign user to specific group
     */
    async assignUserToGroup(
        eventId: string,
        dto: AssignUserToGroupDto,
        adminUserId: string,
    ) {
        // 1. Validate user eligibility
        const { transaction } = await validateUserEligibility(
            this.prisma,
            dto.userId,
            eventId,
            dto.transactionId,
        );

        // 2. Check if user already assigned
        const existingMember = await this.prisma.matchingMember.findFirst({
            where: {
                userId: dto.userId,
                group: {
                    eventId,
                },
            },
            include: {
                group: true,
            },
        });

        if (existingMember) {
            throw new BadRequestException(
                `User is already assigned to Group ${existingMember.group.groupNumber}`,
            );
        }

        // 3. Find or create target group
        let targetGroup = await this.prisma.matchingGroup.findFirst({
            where: {
                eventId,
                groupNumber: dto.targetGroupNumber,
            },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                personalityResult: true,
                            },
                        },
                    },
                },
            },
        });

        // Create group if doesn't exist
        if (!targetGroup) {
            targetGroup = await this.prisma.matchingGroup.create({
                data: {
                    eventId,
                    groupNumber: dto.targetGroupNumber,
                    status: MatchingStatus.MATCHED,
                    averageMatchScore: 0,
                    minMatchScore: 0,
                    groupSize: 0,
                    thresholdUsed: 0,
                    hasManualChanges: true,
                    lastModifiedBy: adminUserId,
                    lastModifiedAt: new Date(),
                },
                include: {
                    members: {
                        include: {
                            user: {
                                include: {
                                    personalityResult: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        // 4. Check group size constraint
        validateGroupSize(
            targetGroup.members.length,
            MATCHING_CONSTANTS.MAX_GROUP_SIZE,
            dto.targetGroupNumber,
        );

        // 5. Create user profile for score calculation
        const userProfile = mapTransactionToUserProfile(
            dto.userId,
            dto.transactionId,
            transaction.user,
        );

        // 6. Calculate match scores with existing members
        const matchScores: Record<string, number> = {};
        const existingProfiles = targetGroup.members.map((m) =>
            mapMemberToUserProfile(m),
        );

        for (const existingProfile of existingProfiles) {
            const score = this.scoreService.calculateMatchScore(
                userProfile,
                existingProfile,
            );
            matchScores[existingProfile.userId] = score.score;
        }

        // 7. Add user to group
        const newMember = await this.prisma.matchingMember.create({
            data: {
                groupId: targetGroup.id,
                userId: dto.userId,
                transactionId: dto.transactionId,
                matchScores,
                personalitySnapshot: {
                    energyScore: userProfile.energyScore,
                    opennessScore: userProfile.opennessScore,
                    structureScore: userProfile.structureScore,
                    affectScore: userProfile.affectScore,
                    comfortScore: userProfile.comfortScore,
                    lifestyleScore: userProfile.lifestyleScore,
                    rawScores: userProfile.rawScores,
                },
                isManuallyAssigned: true,
                assignedBy: adminUserId,
                assignedAt: new Date(),
                assignmentNote: dto.note,
            },
        });

        // 8. Update existing members' match scores
        for (const member of targetGroup.members) {
            const existingScores =
                (member.matchScores as Record<string, number>) || {};
            existingScores[dto.userId] = matchScores[member.userId];

            await this.prisma.matchingMember.update({
                where: { id: member.id },
                data: {
                    matchScores: existingScores,
                },
            });
        }

        // 9. Recalculate group statistics
        await this.statisticsService.recalculateGroupStatistics(
            targetGroup.id,
            adminUserId,
        );

        // 10. Get updated group
        const updatedGroup = await this.prisma.matchingGroup.findUnique({
            where: { id: targetGroup.id },
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
        });

        return {
            message: 'User successfully assigned to group',
            group: updatedGroup,
            member: newMember,
        };
    }

    /**
     * Move user between groups
     */
    async moveUserBetweenGroups(
        eventId: string,
        dto: MoveUserBetweenGroupsDto,
        adminUserId: string,
    ) {
        // 1. Validate groups exist
        const [fromGroup, toGroup] = await Promise.all([
            this.prisma.matchingGroup.findUnique({
                where: { id: dto.fromGroupId },
                include: { members: true },
            }),
            this.prisma.matchingGroup.findUnique({
                where: { id: dto.toGroupId },
                include: {
                    members: {
                        include: {
                            user: {
                                include: {
                                    personalityResult: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        if (!fromGroup || !toGroup) {
            throw new NotFoundException('One or both groups not found');
        }

        if (fromGroup.eventId !== eventId || toGroup.eventId !== eventId) {
            throw new BadRequestException('Groups must belong to the same event');
        }

        // 2. Check target group size
        validateGroupSize(
            toGroup.members.length,
            MATCHING_CONSTANTS.MAX_GROUP_SIZE,
        );

        // 3. Find member in from group
        const member = await this.prisma.matchingMember.findFirst({
            where: {
                userId: dto.userId,
                groupId: dto.fromGroupId,
            },
            include: {
                user: {
                    include: {
                        personalityResult: true,
                    },
                },
            },
        });

        if (!member) {
            throw new NotFoundException('User not found in source group');
        }

        // 4. Calculate new match scores with target group members
        const userProfile = mapMemberToUserProfile(member);

        const newMatchScores: Record<string, number> = {};
        for (const targetMember of toGroup.members) {
            const targetProfile = mapMemberToUserProfile(targetMember);
            const score = this.scoreService.calculateMatchScore(
                userProfile,
                targetProfile,
            );
            newMatchScores[targetMember.userId] = score.score;
        }

        // 5. Update member's group and scores
        await this.prisma.matchingMember.update({
            where: { id: member.id },
            data: {
                groupId: dto.toGroupId,
                matchScores: newMatchScores,
                isManuallyAssigned: true,
                assignedBy: adminUserId,
                assignedAt: new Date(),
                previousGroupId: dto.fromGroupId,
                assignmentNote: dto.note,
            },
        });

        // 6. Update target group members' scores
        for (const targetMember of toGroup.members) {
            const existingScores =
                (targetMember.matchScores as Record<string, number>) || {};
            existingScores[dto.userId] = newMatchScores[targetMember.userId];

            await this.prisma.matchingMember.update({
                where: { id: targetMember.id },
                data: { matchScores: existingScores },
            });
        }

        // 7. Remove user's scores from source group members
        for (const sourceMember of fromGroup.members) {
            if (sourceMember.userId === dto.userId) continue;

            const scores = sourceMember.matchScores as Record<string, number>;
            delete scores[dto.userId];

            await this.prisma.matchingMember.update({
                where: { id: sourceMember.id },
                data: { matchScores: scores },
            });
        }

        // 8. Recalculate both groups' statistics
        await Promise.all([
            this.statisticsService.recalculateGroupStatistics(
                dto.fromGroupId,
                adminUserId,
            ),
            this.statisticsService.recalculateGroupStatistics(
                dto.toGroupId,
                adminUserId,
            ),
        ]);

        // 9. Delete source group if empty
        const updatedFromGroup = await this.prisma.matchingGroup.findUnique({
            where: { id: dto.fromGroupId },
            include: { members: true },
        });

        if (updatedFromGroup && updatedFromGroup.members.length === 0) {
            await this.prisma.matchingGroup.delete({
                where: { id: dto.fromGroupId },
            });
        }

        return {
            message: 'User successfully moved between groups',
            fromGroupId: dto.fromGroupId,
            toGroupId: dto.toGroupId,
            deletedFromGroup: updatedFromGroup?.members.length === 0,
        };
    }

    /**
     * Remove user from group
     */
    async removeUserFromGroup(
        eventId: string,
        dto: RemoveUserFromGroupDto,
        adminUserId: string,
    ) {
        // 1. Find member
        const member = await this.prisma.matchingMember.findFirst({
            where: {
                userId: dto.userId,
                groupId: dto.groupId,
                group: {
                    eventId,
                },
            },
            include: {
                group: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!member) {
            throw new NotFoundException('User not found in group');
        }

        // 2. Remove member's scores from other members
        for (const otherMember of member.group.members) {
            if (otherMember.userId === dto.userId) continue;

            const scores = otherMember.matchScores as Record<string, number>;
            delete scores[dto.userId];

            await this.prisma.matchingMember.update({
                where: { id: otherMember.id },
                data: { matchScores: scores },
            });
        }

        // 3. Delete member
        await this.prisma.matchingMember.delete({
            where: { id: member.id },
        });

        // 4. Recalculate group or delete if empty
        const updatedGroup = await this.prisma.matchingGroup.findUnique({
            where: { id: dto.groupId },
            include: { members: true },
        });

        if (updatedGroup && updatedGroup.members.length === 0) {
            await this.prisma.matchingGroup.delete({
                where: { id: dto.groupId },
            });

            return {
                message: 'User removed and empty group deleted',
                groupDeleted: true,
            };
        }

        if (updatedGroup) {
            await this.statisticsService.recalculateGroupStatistics(
                dto.groupId,
                adminUserId,
            );
        }

        return {
            message: 'User successfully removed from group',
            groupDeleted: false,
        };
    }

    /**
     * Create empty manual group
     */
    async createManualGroup(
        eventId: string,
        dto: CreateManualGroupDto,
        adminUserId: string,
    ) {
        // Check if group number already exists
        const existing = await this.prisma.matchingGroup.findFirst({
            where: {
                eventId,
                groupNumber: dto.groupNumber,
            },
        });

        if (existing) {
            throw new BadRequestException(
                `Group ${dto.groupNumber} already exists`,
            );
        }

        const group = await this.prisma.matchingGroup.create({
            data: {
                eventId,
                groupNumber: dto.groupNumber,
                status: MatchingStatus.MATCHED,
                averageMatchScore: 0,
                minMatchScore: 0,
                groupSize: 0,
                thresholdUsed: 0,
                hasManualChanges: true,
                lastModifiedBy: adminUserId,
                lastModifiedAt: new Date(),
                tableNumber: dto.tableNumber,
                venueName: dto.venueName,
            },
        });

        return {
            message: 'Manual group created successfully',
            group,
        };
    }

    /**
     * Bulk assign users to group
     */
    async bulkAssignUsers(
        eventId: string,
        dto: BulkAssignUsersDto,
        adminUserId: string,
    ) {
        const results = {
            success: [] as string[],
            failed: [] as { userId: string; reason: string }[],
        };

        for (const userId of dto.userIds) {
            try {
                // Find transaction for this user
                const transaction = await this.prisma.legacyTransaction.findFirst({
                    where: {
                        userId,
                        eventId,
                        paymentStatus: 'PAID',
                    },
                });

                if (!transaction) {
                    results.failed.push({
                        userId,
                        reason: 'No paid transaction found',
                    });
                    continue;
                }

                // Get target group
                const group = await this.prisma.matchingGroup.findUnique({
                    where: { id: dto.targetGroupId },
                });

                if (!group) {
                    results.failed.push({
                        userId,
                        reason: 'Target group not found',
                    });
                    continue;
                }

                // Assign user
                await this.assignUserToGroup(
                    eventId,
                    {
                        userId,
                        transactionId: transaction.id,
                        targetGroupNumber: group.groupNumber,
                        note: dto.note,
                    },
                    adminUserId,
                );

                results.success.push(userId);
            } catch (error: any) {
                results.failed.push({
                    userId,
                    reason: error.message || 'Unknown error',
                });
            }
        }

        return {
            message: 'Bulk assignment completed',
            successCount: results.success.length,
            failedCount: results.failed.length,
            results,
        };
    }
}
