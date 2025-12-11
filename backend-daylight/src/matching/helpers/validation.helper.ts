import {
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';
import type { User } from '@prisma/client';

/**
 * Validation Helpers
 * Centralized validation utilities for matching operations
 */

/**
 * Validates that an event exists
 */
export async function validateEventExists(
    prisma: PrismaService,
    eventId: string,
): Promise<void> {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        throw new NotFoundException('Event not found');
    }
}

/**
 * Validates that a user is eligible for matching
 * (has paid transaction + personality result)
 */
export async function validateUserEligibility(
    prisma: PrismaService,
    userId: string,
    eventId: string,
    transactionId?: string,
): Promise<{
    transaction: any;
    user: User;
}> {
    const where: Prisma.TransactionWhereInput = {
        userId,
        eventId,
        status: PaymentStatus.PAID,
    };

    if (transactionId) {
        where.id = transactionId;
    }

    const transaction = await prisma.transaction.findFirst({
        where,
        include: {
            user: {
                include: {
                    personalityResult: true,
                },
            },
        },
    });

    if (!transaction) {
        throw new NotFoundException(
            'User has not purchased this event or payment not confirmed',
        );
    }

    if (!transaction.user.personalityResult) {
        throw new BadRequestException(
            'User does not have personality result',
        );
    }

    return { transaction, user: transaction.user };
}

/**
 * Validates group size constraints
 */
export function validateGroupSize(
    currentSize: number,
    maxSize: number,
    groupIdentifier?: string | number,
): void {
    if (currentSize >= maxSize) {
        const groupLabel = groupIdentifier
            ? `Group ${groupIdentifier}`
            : 'Group';
        throw new BadRequestException(
            `${groupLabel} is already full (max ${maxSize} members)`,
        );
    }
}
