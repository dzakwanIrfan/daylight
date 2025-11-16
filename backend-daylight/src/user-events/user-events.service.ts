import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class UserEventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's upcoming events (paid and event date >= today)
   */
  async getMyEvents(userId: string) {
    const now = new Date();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        event: {
          eventDate: {
            gte: now,
          },
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          eventDate: 'asc',
        },
      },
    });

    const events = transactions.map((t) => ({
      ...t.event,
      transaction: {
        id: t.id,
        merchantRef: t.merchantRef,
        paymentStatus: t.paymentStatus,
        amount: t.amount,
        paidAt: t.paidAt,
        createdAt: t.createdAt,
      },
    }));

    return {
      data: events,
      total: events.length,
    };
  }

  /**
   * Get user's past events (paid and event date < today)
   */
  async getPastEvents(userId: string) {
    const now = new Date();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        paymentStatus: PaymentStatus.PAID,
        event: {
          eventDate: {
            lt: now,
          },
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          eventDate: 'desc',
        },
      },
    });

    const events = transactions.map((t) => ({
      ...t.event,
      transaction: {
        id: t.id,
        merchantRef: t.merchantRef,
        paymentStatus: t.paymentStatus,
        amount: t.amount,
        paidAt: t.paidAt,
        createdAt: t.createdAt,
      },
    }));

    return {
      data: events,
      total: events.length,
    };
  }
}