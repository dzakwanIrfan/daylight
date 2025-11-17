import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalityService } from '../personality/personality.service';
import { PaymentStatus, TransactionType } from '@prisma/client';

@Injectable()
export class UserStatsService {
  constructor(
    private prisma: PrismaService,
    private personalityService: PersonalityService,
  ) {}

  async getUserStats(userId: string) {
    // Get personality type
    const personalityResult = await this.personalityService.getResultByUserId(userId);
    const personalityType = personalityResult?.archetype.name || null;

    // Get events attended (paid transactions with completed events)
    const now = new Date();
    const eventsAttended = await this.prisma.transaction.count({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        transactionType: TransactionType.EVENT,
        event: {
          eventDate: {
            lt: now, // Event date has passed
          },
        },
      },
    });

    // Get upcoming events (paid transactions with future events)
    const upcomingEvents = await this.prisma.transaction.count({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        transactionType: TransactionType.EVENT,
        event: {
          eventDate: {
            gte: now, // Event date is in the future
          },
        },
      },
    });

    // Get total events (all paid event transactions)
    const totalEvents = await this.prisma.transaction.count({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        transactionType: TransactionType.EVENT,
      },
    });

    // Connections - default 0 for now (future feature)
    const connections = 0;

    // Check active subscription
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        plan: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        personalityType,
        eventsAttended,
        upcomingEvents,
        totalEvents,
        connections,
        hasActiveSubscription: !!activeSubscription,
        subscription: activeSubscription
          ? {
              planName: activeSubscription.plan.name,
              planType: activeSubscription.plan.type,
              endDate: activeSubscription.endDate,
            }
          : null,
      },
    };
  }

  async getRecentActivity(userId: string, limit: number = 5) {
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        transactionType: TransactionType.EVENT,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            eventDate: true,
            venue: true,
            city: true,
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
      take: limit,
    });

    return {
      success: true,
      data: recentTransactions.map((transaction) => ({
        id: transaction.id,
        paidAt: transaction.paidAt,
        amount: transaction.amount,
        event: transaction.event,
      })),
    };
  }
}