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
  Prisma,
  User,
} from '@prisma/client';
import { 
  CreateSubscriptionPlanDto, 
  UpdateSubscriptionPlanDto 
} from './dto/subscription-plan.dto';
import { QueryUserSubscriptionsDto } from './dto/query-subscriptions.dto';
import { addMonths } from 'date-fns';
import { QueryAdminSubscriptionsDto, SortOrder } from './dto/query-admin-subscriptions.dto';
import { BulkSubscriptionActionDto, BulkSubscriptionActionType } from './dto/bulk-subscription-action.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * SUBSCRIPTION PLANS (USER)
   */

  /**
   * Get active plans with pricing based on user's location
   */
  async getActivePlans(user: User) {
    // Get user with city and country data
    const userWithLocation = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        currentCity: {
          include: {
            country: true,
          },
        },
      },
    });

    // Extract currency and countryCode from user's location
    const currency = userWithLocation?.currentCity?.country?.currency;
    console.log('User currency:', currency);
    const countryCode = userWithLocation?.currentCity?.country?.code;

    const plans = await this.prisma. subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        prices: {
          where: {
            isActive: true,
          },
          orderBy: {
            countryCode: 'asc', // Country-specific prices first
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Transform to include best price for each plan
    const plansWithPricing = plans.map((plan) => {
      // Get the best matching price based on user's location
      const price = this.getBestPrice(plan. prices, currency, countryCode);

      return {
        ...plan,
        // Current price based on user's location
        currentPrice: price?. amount || plan.price,
        currentCurrency: price?.currency || plan.currency,
        // User's detected location
        userLocation: {
          currency,
          countryCode,
          cityId: userWithLocation?.currentCityId,
          cityName: userWithLocation?.currentCity?.name,
          countryName: userWithLocation?.currentCity?. country?.name,
        },
        // All available prices (for transparency)
        availablePrices: plan.prices,
      };
    });

    return {
      success: true,
      data: plansWithPricing,
    };
  }

  /**
   * Get plan by ID with pricing based on user's location
   */
  async getPlanById(planId: string, user: User) {
    // Get user with city and country data
    const userWithLocation = await this. prisma.user.findUnique({
      where: { id: user.id },
      include: {
        currentCity: {
          include: {
            country: true,
          },
        },
      },
    });

    // Extract currency and countryCode from user's location
    const currency = userWithLocation?.currentCity?.country?.currency;
    const countryCode = userWithLocation?.currentCity?.country?.code;

    const plan = await this.prisma. subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: [
            { countryCode: 'asc' },
            { currency: 'asc' },
          ],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Get the best matching price
    const price = this.getBestPrice(plan.prices, currency, countryCode);

    return {
      success: true,
      data: {
        ...plan,
        currentPrice: price?.amount || plan. price,
        currentCurrency: price?.currency || plan.currency,
        selectedPrice: price, // Full price object with details
        userLocation: {
          currency,
          countryCode,
          cityId: userWithLocation?.currentCityId,
          cityName: userWithLocation?.currentCity?.name,
          countryName: userWithLocation?.currentCity?.country?.name,
        },
      },
    };
  }

  /**
   * ADMIN: Get all plans with all pricing options
   */
  async getAllPlans(isActive?: boolean) {
    const where: Prisma. SubscriptionPlanWhereInput = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const plans = await this.prisma.subscriptionPlan.findMany({
      where,
      include: {
        prices: {
          orderBy: [
            { countryCode: 'asc' },
            { currency: 'asc' },
          ],
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: plans,
    };
  }

  async createPlan(dto: CreateSubscriptionPlanDto) {
    const { prices, price, currency, ... planData } = dto;

    // Create plan with nested prices
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        ...planData,
        // Legacy fields for backward compatibility
        price: price || (prices && prices[0]?.amount) || 0,
        currency: currency || (prices && prices[0]?.currency) || 'IDR',
        // Create multi-currency prices
        prices: prices
          ? {
              create: prices.map((p) => ({
                currency: p.currency,
                amount: p.amount,
                countryCode: p.countryCode || null,
                isActive: p.isActive !== false,
              })),
            }
          : undefined,
      },
      include: {
        prices: true,
      },
    });

    this.logger.log(`Created subscription plan ${plan.id} with ${plan.prices.length} price(s)`);

    return {
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    };
  }

  async updatePlan(planId: string, dto: UpdateSubscriptionPlanDto) {
    const { prices, price, currency, ...planData } = dto;

    // If prices array is provided, replace all existing prices
    if (prices) {
      // Delete existing prices and create new ones
      await this. prisma.subscriptionPlanPrice.deleteMany({
        where: { subscriptionPlanId: planId },
      });

      const plan = await this.prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          ... planData,
          // Update legacy fields if provided
          ...(price !== undefined && { price }),
          ...(currency && { currency }),
          // Create new prices
          prices: {
            create: prices.map((p) => ({
              currency: p.currency,
              amount: p.amount,
              countryCode: p.countryCode || null,
              isActive: p.isActive !== false,
            })),
          },
        },
        include: {
          prices: true,
        },
      });

      this.logger.log(`Updated subscription plan ${plan.id} with ${plan.prices.length} price(s)`);

      return {
        success: true,
        message: 'Subscription plan updated successfully',
        data: plan,
      };
    }

    // If only legacy fields provided, update those
    const plan = await this. prisma.subscriptionPlan. update({
      where: { id: planId },
      data: {
        ...planData,
        ...(price !== undefined && { price }),
        ...(currency && { currency }),
      },
      include: {
        prices: true,
      },
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
        'Cannot delete plan with active subscriptions',
      );
    }

    // Cascade delete will remove associated prices
    await this.prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    return {
      success: true,
      message: 'Subscription plan deleted successfully',
    };
  }

  /**
   * Helper: Get best matching price for currency and country
   * Priority: Exact match > Currency default > Country match > First active
   */
  private getBestPrice(
    prices: any[],
    currency?: string,
    countryCode?: string,
  ) {
    if (!prices || prices.length === 0) return null;

    // Priority 1: Exact match (currency + country)
    if (currency && countryCode) {
      const exactMatch = prices.find(
        (p) =>
          p.currency === currency &&
          p.countryCode === countryCode &&
          p.isActive,
      );
      if (exactMatch) {
        this.logger.debug(`Exact match found: ${currency} for ${countryCode}`);
        return exactMatch;
      }
    }

    // Priority 2: Currency match with no country (default pricing)
    if (currency) {
      const currencyMatch = prices.find(
        (p) => p.currency === currency && ! p.countryCode && p.isActive,
      );
      if (currencyMatch) {
        this.logger.debug(`Currency default match found: ${currency}`);
        return currencyMatch;
      }
    }

    // Priority 3: Country match (any currency)
    if (countryCode) {
      const countryMatch = prices.find(
        (p) => p.countryCode === countryCode && p. isActive,
      );
      if (countryMatch) {
        this.logger.debug(`Country match found: ${countryCode}`);
        return countryMatch;
      }
    }

    // Priority 4: First active price (fallback)
    const fallback = prices.find((p) => p.isActive) || prices[0];
    this.logger.debug('Using fallback price');
    return fallback;
  }

  /**
   * Get all subscriptions with advanced filtering (Admin)
   */
  async getAdminSubscriptions(queryDto: QueryAdminSubscriptionsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
      status,
      userId,
      planId,
      dateFrom,
      dateTo,
    } = queryDto;

    const where: Prisma.UserSubscriptionWhereInput = {};

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { plan: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (planId) where.planId = planId;

    if (dateFrom || dateTo) {
      where. createdAt = {};
      if (dateFrom) where.createdAt. gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
              durationInMonths: true,
              prices: true, // Include multi-currency prices
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
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        status,
        userId,
        planId,
        dateFrom,
        dateTo,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  async bulkSubscriptionAction(bulkActionDto: BulkSubscriptionActionDto) {
    const { subscriptionIds, action } = bulkActionDto;

    const subscriptions = await this.prisma. userSubscription.findMany({
      where: { id: { in: subscriptionIds } },
      select: { id: true, status: true },
    });

    if (subscriptions.length !== subscriptionIds.length) {
      throw new BadRequestException('Some subscription IDs are invalid');
    }

    let result;

    switch (action) {
      case BulkSubscriptionActionType.CANCEL:
        result = await this. prisma.userSubscription.updateMany({
          where: { id: { in: subscriptionIds } },
          data: {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
        this.logger.log(`Bulk cancelled ${result.count} subscriptions`);
        break;

      case BulkSubscriptionActionType. ACTIVATE:
        const pendingIds = subscriptions
          .filter((s) => s.status === SubscriptionStatus.PENDING)
          .map((s) => s. id);

        if (pendingIds.length === 0) {
          throw new BadRequestException('No pending subscriptions to activate');
        }

        for (const id of pendingIds) {
          await this.activateSubscription(id);
        }

        result = { count: pendingIds.length };
        this.logger.log(`Bulk activated ${result.count} subscriptions`);
        break;

      default:
        throw new BadRequestException('Invalid bulk action');
    }

    return {
      success: true,
      message: `Bulk action ${action} completed successfully`,
      affectedCount: result.count,
    };
  }

  async exportSubscriptions(queryDto: QueryAdminSubscriptionsDto) {
    const { search, status, userId, planId, dateFrom, dateTo } = queryDto;

    const where: Prisma.UserSubscriptionWhereInput = {};

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { plan: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (planId) where. planId = planId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt. gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const subscriptions = await this.prisma.userSubscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            durationInMonths: true,
            prices: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions;
  }

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
        plan: {
          include: {
            prices: true,
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
      orderBy: { endDate: 'desc' },
    });

    return {
      success: true,
      data: subscription,
      hasActiveSubscription: !!subscription,
    };
  }

  async hasValidSubscription(userId: string): Promise<boolean> {
    const now = new Date();

    const count = await this.prisma.userSubscription.count({
      where: {
        userId,
        status: SubscriptionStatus. ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    return count > 0;
  }

  async getUserSubscriptions(
    userId: string,
    queryDto: QueryUserSubscriptionsDto,
  ) {
    const { page = 1, limit = 10, status, sortOrder = 'desc' } = queryDto;

    const where: Prisma.UserSubscriptionWhereInput = { userId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const take = limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription. findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          plan: {
            include: {
              prices: true,
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
      this.prisma. userSubscription.count({ where }),
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

  async getSubscriptionById(subscriptionId: string, userId: string) {
    const subscription = await this.prisma. userSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      include: {
        plan: {
          include: {
            prices: true,
          },
        },
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

  async createPendingSubscription(
    userId: string,
    planId: string,
    transactionId: string,
  ) {
    const hasActive = await this.hasValidSubscription(userId);
    if (hasActive) {
      throw new ConflictException(
        'You already have an active subscription.  Please wait until it expires.',
      );
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || ! plan.isActive) {
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
      `Created pending subscription ${subscription.id} for user ${userId}`,
    );

    return subscription;
  }

  async activateSubscription(subscriptionId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      this.logger.warn(`Subscription ${subscriptionId} is already active`);
      return subscription;
    }

    const startDate = new Date();
    const endDate = addMonths(startDate, subscription. plan.durationInMonths);

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

    this.logger. log(
      `Activated subscription ${subscriptionId} for user ${subscription.userId}`,
    );

    return updated;
  }

  async cancelSubscription(
    subscriptionId: string,
    userId: string,
    reason?: string,
  ) {
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

    const updated = await this.prisma. userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus. CANCELLED,
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
        `Auto-expired subscription ${subscription.id} for user ${subscription.userId}`,
      );
    }

    return {
      success: true,
      expiredCount: expiredSubscriptions.length,
    };
  }

  async getAllSubscriptions(queryDto: any) {
    const { page = 1, limit = 10, status, userId } = queryDto;

    const where: Prisma.UserSubscriptionWhereInput = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const skip = (page - 1) * limit;
    const take = limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma. userSubscription.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: {
            include: {
              prices: true,
            },
          },
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
      this. prisma.userSubscription.count({
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