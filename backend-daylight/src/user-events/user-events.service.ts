import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, TransactionType } from '@prisma/client';
import { RegisterFreeEventDto } from './dto/register-free-event.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserEventsService {
  private readonly logger = new Logger(UserEventsService.name);
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

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
        event: {
          include: {
            partner: true,
          }
        },
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
        event: {
          include: {
            partner: true,
          }
        }
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

  async registerFreeEvent(userId: string, dto: RegisterFreeEventDto) {
    const { eventId, customerName, customerEmail, customerPhone } = dto;

    // Check if user has valid subscription
    const hasValidSubscription = await this.subscriptionsService.hasValidSubscription(userId);
    
    if (!hasValidSubscription) {
      throw new ForbiddenException(
        'Active subscription required to register for free events'
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
        paymentStatus: PaymentStatus.PAID,
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You have already registered for this event');
    }

    // Create FREE transaction
    const merchantRef = `FREE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        eventId,
        tripayReference: merchantRef, // Use same as merchantRef for free
        merchantRef,
        paymentMethodCode: 'SUBSCRIPTION',
        paymentMethod: 'SUBSCRIPTION',
        paymentName: 'Premium Subscription',
        paymentStatus: PaymentStatus.PAID, // Immediately PAID
        transactionType: TransactionType.EVENT,
        amount: event.price,
        feeMerchant: 0,
        feeCustomer: 0,
        totalFee: 0,
        amountReceived: 0, // No money received
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        paidAt: new Date(),
        orderItems: [
          {
            name: event.title,
            price: event.price,
            quantity: 1,
            subtotal: event.price,
          },
        ],
      },
      include: {
        event: true,
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
      `User ${userId} registered for free event ${eventId} via subscription`
    );

    return {
      success: true,
      message: 'Successfully registered for event',
      data: transaction,
    };
  }
}