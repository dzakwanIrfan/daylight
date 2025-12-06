import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethodType, TransactionStatus } from '@prisma/client';
import { RegisterFreeEventDto } from './dto/register-free-event.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Injectable()
export class UserEventsService {
  private readonly logger = new Logger(UserEventsService.name);
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  /**
   * Get user's upcoming events (paid via Xendit and event date >= today)
   */
  async getMyEvents(userId: string) {
    const now = new Date();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: TransactionStatus.PAID,
        event: {
          eventDate: {
            gte: now,
          },
        },
      },
      include: {
        event: {
          include: {
            partner: true,
            cityRelation: {
              include: {
                country: true,
              },
            },
          },
        },
        paymentMethod: {
          include: {
            country: true,
          },
        },
        actions: true,
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
        externalId: t.externalId,
        status: t.status,
        amount: t.amount.toNumber(),
        totalFee: t.totalFee.toNumber(),
        finalAmount: t.finalAmount.toNumber(),
        paymentMethod: t.paymentMethod,
        paidAt: t.updatedAt,
        createdAt: t.createdAt,
      },
    }));

    return {
      data: events,
      total: events.length,
    };
  }

  /**
   * Get user's past events (paid via Xendit and event date < today)
   */
  async getPastEvents(userId: string) {
    const now = new Date();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: TransactionStatus.PAID,
        event: {
          eventDate: {
            lt: now,
          },
        },
      },
      include: {
        event: {
          include: {
            partner: true,
            cityRelation: {
              include: {
                country: true,
              },
            },
          },
        },
        paymentMethod: {
          include: {
            country: true,
          },
        },
        actions: true,
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
        externalId: t.externalId,
        status: t.status,
        amount: t.amount.toNumber(),
        totalFee: t.totalFee.toNumber(),
        finalAmount: t.finalAmount.toNumber(),
        paymentMethod: t.paymentMethod,
        paidAt: t.updatedAt,
        createdAt: t.createdAt,
      },
    }));

    return {
      data: events,
      total: events.length,
    };
  }

  /**
   * Register for event with active subscription (FREE)
   * Creates a Xendit-style transaction without actual payment
   */
  async registerFreeEvent(userId: string, dto: RegisterFreeEventDto) {
    const { eventId, customerName, customerEmail, customerPhone } = dto;

    // Check if user has valid subscription
    const hasValidSubscription =
      await this.subscriptionsService.hasValidSubscription(userId);

    if (!hasValidSubscription) {
      throw new ForbiddenException(
        'Active subscription required to register for free events',
      );
    }

    // Get event details
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive || event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not available');
    }

    // Check if user already registered
    const existingRegistration = await this.prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: TransactionStatus.PAID,
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You have already registered for this event');
    }

    // Create FREE transaction using Xendit Transaction model
    const externalId = `FREE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        eventId,
        paymentMethodName: PaymentMethodType.SUBSCRIPTION,
        externalId,
        status: TransactionStatus.PAID, // Immediately PAID
        amount: 0,
        totalFee: 0,
        finalAmount: 0,
        paymentUrl: null,
        actions: {
          create: [
            {
              type: 'PRESENT_TO_CUSTOMER',
              descriptor: 'PAYMENT_CODE',
              value: 'SUBSCRIPTION_ACCESS',
            },
          ],
        },
      },
      include: {
        event: {
          include: {
            partner: true,
          },
        },
        paymentMethod: true,
        actions: true,
      },
    });

    // Increment participants
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    this.logger.log(
      `User ${userId} registered for free event ${eventId} via subscription`,
    );

    return {
      success: true,
      message: 'Successfully registered for event',
      data: {
        id: transaction.id,
        externalId: transaction.externalId,
        status: transaction.status,
        amount: transaction.amount.toNumber(),
        totalFee: transaction.totalFee.toNumber(),
        finalAmount: transaction.finalAmount.toNumber(),
        event: transaction.event,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
      },
    };
  }
}
