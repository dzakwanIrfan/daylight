import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, TransactionType } from '@prisma/client';
import { UserMatchingProfile } from '../types/matching.types';
import { mapTransactionToUserProfile } from '../helpers/user-profile.mapper';

/**
 * Participant Eligibility Service
 * Handles retrieval and filtering of eligible participants for matching
 */
@Injectable()
export class ParticipantEligibilityService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get eligible participants (paid + has personality result)
     */
    async getEligibleParticipants(
        eventId: string,
    ): Promise<UserMatchingProfile[]> {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                eventId,
                transactionType: TransactionType.EVENT,
                status: PaymentStatus.PAID,
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

        return transactions.map((tx) =>
            mapTransactionToUserProfile(tx.userId, tx.id, tx.user),
        );
    }

    /**
     * Get unassigned participants for manual assignment
     */
    async getUnassignedParticipants(eventId: string) {
        // Get all paid participants
        const allParticipants = await this.getEligibleParticipants(eventId);

        // Get already assigned user IDs
        const assignedMembers = await this.prisma.matchingMember.findMany({
            where: {
                group: {
                    eventId,
                },
            },
            select: {
                userId: true,
            },
        });

        const assignedUserIds = new Set(assignedMembers.map((m) => m.userId));

        // Filter unassigned
        const unassigned = allParticipants.filter(
            (p) => !assignedUserIds.has(p.userId),
        );

        return {
            total: unassigned.length,
            participants: unassigned.map((p) => ({
                userId: p.userId,
                transactionId: p.transactionId,
                name: p.name,
                email: p.email,
                personalitySnapshot: {
                    energyScore: p.energyScore,
                    opennessScore: p.opennessScore,
                    structureScore: p.structureScore,
                    affectScore: p.affectScore,
                    comfortScore: p.comfortScore,
                    lifestyleScore: p.lifestyleScore,
                },
            })),
        };
    }
}
