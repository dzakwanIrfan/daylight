import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  SubscriptionStatus, 
  SubscriptionPlanType,
  TransactionType,
  PaymentStatus,
  Prisma 
} from '@prisma/client';
import { 
  CreateSubscriptionPlanDto, 
  UpdateSubscriptionPlanDto 
} from './dto/subscription-plan.dto';
import { CreateSubscriptionDto } from './dto/subscribe.dto';
import { QueryUserSubscriptionsDto } from './dto/query-subscriptions.dto';
import { addMonths, isAfter, isBefore } from 'date-fns';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ========================================
   * SUBSCRIPTION PLANS (ADMIN)
   * ========================================
   */

  async getActivePlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: plans,
    };
  }

  async getAllPlans(isActive?: boolean) {
    const where: Prisma.SubscriptionPlanWhereInput = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const plans = await this.prisma.subscriptionPlan.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: plans,
    };
  }

  async getPlanById(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return {
      success: true,
      data: plan,
    };
  }

  async createPlan(dto: CreateSubscriptionPlanDto) {
    const plan = await this.prisma.subscriptionPlan.create({
      data: dto,
    });

    return {
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    };
  }

  async updatePlan(planId: string, dto: UpdateSubscriptionPlanDto) {
    const plan = await this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data: dto,
    });

    return {
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    };
  }

  async deletePlan(planId: string) {
    // Check if any active subscriptions use this plan
    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: {
        planId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete plan with active subscriptions'
      );
    }

    await this.prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    return {
      success: true,
      message: 'Subscription plan deleted successfully',
    };
  }

  /**
   * ========================================
   * USER SUBSCRIPTIONS
   * ========================================
   */

  /**
   * Get user's current active subscription
   */
  async getUserActiveSubscription(userId: string) {
    const now = new Date();

    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        plan: true,
        transaction: {
          select: {
            id: true,
            merchantRef: true,
            amount: true,
            paymentStatus: true,
            paidAt: true,
          },
        },
      },
      orderBy: { endDate: 'desc' },
    });

    return {
      success: true,
      data: subscription,
      hasActiveSubscription: !!subscription,
    };
  }

  /**
   * Check if user has valid subscription (for event access)
   */
  async hasValidSubscription(userId: string): Promise<boolean> {
    const now = new Date();

    const count = await this.prisma.userSubscription.count({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    return count > 0;
  }

  /**
   * Get user's subscription history
   */
  async getUserSubscriptions(userId: string, queryDto: QueryUserSubscriptionsDto) {
    const { page = 1, limit = 10, status, sortOrder = 'desc' } = queryDto;

    const where: Prisma.UserSubscriptionWhereInput = { userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const take = limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          plan: true,
          transaction: {
            select: {
              id: true,
              merchantRef: true,
              amount: true,
              paymentStatus: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.userSubscription.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId: string, userId: string) {
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      include: {
        plan: true,
        transaction: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return {
      success: true,
      data: subscription,
    };
  }

  /**
   * ========================================
   * SUBSCRIPTION PURCHASE (handled by PaymentService)
   * But we need helper methods here
   * ========================================
   */

  /**
   * Create pending subscription (called by PaymentService)
   */
  async createPendingSubscription(
    userId: string,
    planId: string,
    transactionId: string
  ) {
    // Check if user already has active subscription
    const hasActive = await this.hasValidSubscription(userId);
    if (hasActive) {
      throw new ConflictException(
        'You already have an active subscription. Please wait until it expires.'
      );
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    const subscription = await this.prisma.userSubscription.create({
      data: {
        userId,
        planId,
        transactionId,
        status: SubscriptionStatus.PENDING,
      },
      include: {
        plan: true,
      },
    });

    this.logger.log(
      `Created pending subscription ${subscription.id} for user ${userId}`
    );

    return subscription;
  }

  /**
   * Activate subscription (called when payment is confirmed)
   */
  async activateSubscription(subscriptionId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      this.logger.warn(
        `Subscription ${subscriptionId} is already active`
      );
      return subscription;
    }

    const startDate = new Date();
    const endDate = addMonths(startDate, subscription.plan.durationInMonths);

    const updated = await this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
      },
      include: {
        plan: true,
        transaction: true,
      },
    });

    this.logger.log(
      `Activated subscription ${subscriptionId} for user ${subscription.userId}`
    );

    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, userId: string, reason?: string) {
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new BadRequestException('Subscription has already expired');
    }

    const updated = await this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        metadata: reason
          ? { ...(subscription.metadata as any), cancelReason: reason }
          : subscription.metadata,
      },
      include: {
        plan: true,
      },
    });

    return {
      success: true,
      message: 'Subscription cancelled successfully',
      data: updated,
    };
  }

  /**
   * ========================================
   * CRON JOBS / BACKGROUND TASKS
   * ========================================
   */

  /**
   * Auto-expire subscriptions (run daily via cron)
   */
  async autoExpireSubscriptions() {
    const now = new Date();

    const expiredSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          lt: now,
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await this.prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

      this.logger.log(
        `Auto-expired subscription ${subscription.id} for user ${subscription.userId}`
      );
    }

    return {
      success: true,
      expiredCount: expiredSubscriptions.length,
    };
  }

  /**
   * ========================================
   * ADMIN QUERIES
   * ========================================
   */

  async getAllSubscriptions(queryDto: any) {
    const { page = 1, limit = 10, status, userId } = queryDto;

    const where: Prisma.UserSubscriptionWhereInput = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (page - 1) * limit;
    const take = limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          transaction: {
            select: {
              id: true,
              merchantRef: true,
              amount: true,
              paymentStatus: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.userSubscription.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getSubscriptionStats() {
    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      subscriptionsByPlan,
    ] = await Promise.all([
      this.prisma.userSubscription.count(),
      this.prisma.userSubscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.userSubscription.count({
        where: { status: SubscriptionStatus.EXPIRED },
      }),
      this.prisma.userSubscription.count({
        where: { status: SubscriptionStatus.CANCELLED },
      }),
      this.prisma.userSubscription.groupBy({
        by: ['planId'],
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          expiredSubscriptions,
          cancelledSubscriptions,
        },
        byPlan: subscriptionsByPlan,
      },
    };
  }
}