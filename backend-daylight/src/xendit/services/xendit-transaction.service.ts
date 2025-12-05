import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryXenditTransactionsDto } from '../dto/query-xendit-transactions.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class XenditTransactionService {
    constructor(private readonly prismaService: PrismaService) { }

    /**
     * Get transaction detail dengan actions
     */
    async getTransactionDetail(transactionId: string, userId: string) {
        const transaction = await this.prismaService.transaction.findFirst({
            where: {
                id: transactionId,
                userId: userId,
            },
            include: {
                paymentMethod: {
                    include: {
                        country: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        category: true,
                        eventDate: true,
                        startTime: true,
                        endTime: true,
                        venue: true,
                        address: true,
                        city: true,
                        price: true,
                        currency: true,
                    },
                },
                actions: true,
                userSubscription: {
                    include: {
                        plan: true,
                    },
                },
            },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        return transaction;
    }

    /**
     * Get user's transactions with pagination
     */
    async getUserTransactions(userId: string, query: QueryXenditTransactionsDto) {
        const { page = 1, limit = 10, status, eventId, search } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.TransactionWhereInput = {
            userId,
        };

        if (status) {
            where.status = status;
        }

        if (eventId) {
            where.eventId = eventId;
        }

        if (search) {
            where.OR = [
                { externalId: { contains: search, mode: 'insensitive' } },
                { event: { title: { contains: search, mode: 'insensitive' } } },
            ];
        }

        // Get transactions and total count
        const [transactions, total] = await Promise.all([
            this.prismaService.transaction.findMany({
                where,
                include: {
                    paymentMethod: {
                        include: {
                            country: true,
                        },
                    },
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true,
                            eventDate: true,
                            startTime: true,
                            endTime: true,
                            venue: true,
                            address: true,
                            city: true,
                            price: true,
                            currency: true,
                        },
                    },
                    actions: true,
                    userSubscription: {
                        include: {
                            plan: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prismaService.transaction.count({ where }),
        ]);

        return {
            data: transactions,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
}
