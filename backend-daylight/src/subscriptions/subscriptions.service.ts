import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus, Prisma, User } from '@prisma/client';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  UpdateSubscriptionPlanPricesDto,
} from './dto/subscription-plan.dto';
import {
  CreateSubscriptionPlanPriceDto,
  UpdateSubscriptionPlanPriceDto,
} from './dto/subscription-plan-price.dto';
import { QueryUserSubscriptionsDto } from './dto/query-subscriptions.dto';
import {
  QueryAdminSubscriptionsDto,
  SortOrder,
} from './dto/query-admin-subscriptions.dto';
import {
  BulkSubscriptionActionDto,
  BulkSubscriptionActionType,
} from './dto/bulk-subscription-action.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create subscription plan with multi-country pricing
   */
  async createPlan(dto: CreateSubscriptionPlanDto) {
    const { prices, ...planData } = dto;

    // Validate: Check for duplicate type
    const existingPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { type: dto.type },
    });

    if (existingPlan) {
      throw new ConflictException(
        `A subscription plan with type ${dto.type} already exists. Consider updating the existing plan instead.`,
      );
    }

    // Validate: Ensure all countryIds exist
    const countryIds = prices.map((p) => p.countryId);
    const countries = await this.prisma.country.findMany({
      where: { id: { in: countryIds } },
    });

    if (countries.length !== countryIds.length) {
      throw new BadRequestException('Some country IDs are invalid');
    }

    // Validate: Ensure no duplicate countries
    this.validateNoDuplicateCountries(prices);

    // Get default price for legacy fields (first country)
    const defaultCountry = countries[0];
    const defaultPrice =
      prices.find((p) => p.countryId === defaultCountry.id) || prices[0];

    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        ...planData,
        // Legacy fields for backward compatibility
        price: defaultPrice.amount,
        currency: defaultCountry.currency,
        // Create multi-country prices
        prices: {
          create: prices.map((p) => {
            const country = countries.find((c) => c.id === p.countryId)!;
            return {
              currency: country.currency,
              amount: p.amount,
              countryCode: country.code,
              isActive: p.isActive !== false,
            };
          }),
        },
      },
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
      },
    });

    this.logger.log(
      `Created subscription plan ${plan.id} with ${plan.prices.length} price(s)`,
    );

    return {
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    };
  }

  /**
   * Update subscription plan (metadata only, not prices)
   */
  async updatePlan(planId: string, dto: UpdateSubscriptionPlanDto) {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { prices: true },
    });

    if (!existingPlan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const plan = await this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data: dto,
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
      },
    });

    this.logger.log(`Updated subscription plan ${plan.id}`);

    return {
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan,
    };
  }

  /**
   * Update subscription plan prices (replace all prices)
   */
  async updatePlanPrices(planId: string, dto: UpdateSubscriptionPlanPricesDto) {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { prices: true },
    });

    if (!existingPlan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Validate: Ensure all countryIds exist
    const countryIds = dto.prices.map((p) => p.countryId);
    const countries = await this.prisma.country.findMany({
      where: { id: { in: countryIds } },
    });

    if (countries.length !== countryIds.length) {
      throw new BadRequestException('Some country IDs are invalid');
    }

    // Validate: Ensure no duplicate countries
    this.validateNoDuplicateCountries(dto.prices);

    // Delete existing prices and create new ones
    await this.prisma.subscriptionPlanPrice.deleteMany({
      where: { subscriptionPlanId: planId },
    });

    // Get default price for legacy fields
    const defaultCountry = countries[0];
    const defaultPrice =
      dto.prices.find((p) => p.countryId === defaultCountry.id) ||
      dto.prices[0];

    const plan = await this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        // Update legacy fields
        price: defaultPrice.amount,
        currency: defaultCountry.currency,
        // Create new prices
        prices: {
          create: dto.prices.map((p) => {
            const country = countries.find((c) => c.id === p.countryId)!;
            return {
              currency: country.currency,
              amount: p.amount,
              countryCode: country.code,
              isActive: p.isActive !== false,
            };
          }),
        },
      },
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
      },
    });

    this.logger.log(
      `Updated prices for subscription plan ${plan.id} - ${plan.prices.length} price(s)`,
    );

    return {
      success: true,
      message: 'Subscription plan prices updated successfully',
      data: plan,
    };
  }

  /**
   * Delete subscription plan
   */
  async deletePlan(planId: string) {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Check if any active subscriptions use this plan
    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: {
        planId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        `Cannot delete plan with ${activeSubscriptions} active subscription(s). Please wait until they expire or cancel them first.`,
      );
    }

    // Cascade delete will remove associated prices
    await this.prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    this.logger.log(`Deleted subscription plan ${planId}`);

    return {
      success: true,
      message: 'Subscription plan deleted successfully',
    };
  }

  /**
   * Get all plans (Admin)
   */
  async getAllPlans(isActive?: boolean) {
    const where: Prisma.SubscriptionPlanWhereInput = {};
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const plans = await this.prisma.subscriptionPlan.findMany({
      where,
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
        _count: {
          select: {
            userSubscriptions: {
              where: {
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: plans.map((plan) => ({
        ...plan,
        activeSubscriptionsCount: plan._count.userSubscriptions,
      })),
    };
  }

  /**
   * Get plan by ID (Admin)
   */
  async getPlanByIdAdmin(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
        _count: {
          select: {
            userSubscriptions: {
              where: {
                status: SubscriptionStatus.ACTIVE,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return {
      success: true,
      data: {
        ...plan,
        activeSubscriptionsCount: plan._count.userSubscriptions,
      },
    };
  }

  /**
   * SUBSCRIPTION PLAN PRICE CRUD (ADMIN)
   */

  /**
   * Add a single price to a plan
   */
  async addPriceToPlan(planId: string, dto: CreateSubscriptionPlanPriceDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { prices: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Validate country exists
    const country = await this.prisma.country.findUnique({
      where: { id: dto.countryId },
    });

    if (!country) {
      throw new BadRequestException('Country not found');
    }

    // Check for duplicate country
    const duplicate = plan.prices.find((p) => p.countryCode === country.code);

    if (duplicate) {
      throw new ConflictException(
        `Price for ${country.name} (${country.currency}) already exists`,
      );
    }

    const price = await this.prisma.subscriptionPlanPrice.create({
      data: {
        subscriptionPlanId: planId,
        currency: country.currency,
        amount: dto.amount,
        countryCode: country.code,
        isActive: dto.isActive !== false,
      },
    });

    this.logger.log(`Added price ${price.id} to plan ${planId}`);

    return {
      success: true,
      message: 'Price added successfully',
      data: price,
    };
  }

  /**
   * Update a single price
   */
  async updatePrice(priceId: string, dto: UpdateSubscriptionPlanPriceDto) {
    const existingPrice = await this.prisma.subscriptionPlanPrice.findUnique({
      where: { id: priceId },
    });

    if (!existingPrice) {
      throw new NotFoundException('Price not found');
    }

    const price = await this.prisma.subscriptionPlanPrice.update({
      where: { id: priceId },
      data: dto,
    });

    this.logger.log(`Updated price ${priceId}`);

    return {
      success: true,
      message: 'Price updated successfully',
      data: price,
    };
  }

  /**
   * Delete a single price
   */
  async deletePrice(priceId: string) {
    const existingPrice = await this.prisma.subscriptionPlanPrice.findUnique({
      where: { id: priceId },
      include: {
        subscriptionPlan: {
          include: { prices: true },
        },
      },
    });

    if (!existingPrice) {
      throw new NotFoundException('Price not found');
    }

    // Ensure plan has at least one price remaining
    if (existingPrice.subscriptionPlan.prices.length <= 1) {
      throw new BadRequestException(
        'Cannot delete the last price. A plan must have at least one price.',
      );
    }

    await this.prisma.subscriptionPlanPrice.delete({
      where: { id: priceId },
    });

    this.logger.log(`Deleted price ${priceId}`);

    return {
      success: true,
      message: 'Price deleted successfully',
    };
  }

  /**
   * Get all prices for a plan
   */
  async getPlanPrices(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return {
      success: true,
      data: plan.prices,
    };
  }

  /**
   * HELPER METHODS
   */

  /**
   * Validate no duplicate countries
   */
  private validateNoDuplicateCountries(
    prices: CreateSubscriptionPlanPriceDto[],
  ) {
    const seen = new Set<string>();
    for (const price of prices) {
      if (seen.has(price.countryId)) {
        throw new BadRequestException(`Duplicate country detected in prices`);
      }
      seen.add(price.countryId);
    }
  }

  /**
   * Helper: Get best matching price for user's country
   */
  private getBestPrice(prices: any[], userCountryCode?: string) {
    if (!prices || prices.length === 0) return null;

    // Priority 1: Exact country match
    if (userCountryCode) {
      const exactMatch = prices.find(
        (p) => p.countryCode === userCountryCode && p.isActive,
      );
      if (exactMatch) {
        this.logger.debug(`Exact match found for country: ${userCountryCode}`);
        return exactMatch;
      }
    }

    // Priority 2: First active price (fallback)
    const fallback = prices.find((p) => p.isActive) || prices[0];
    this.logger.debug('Using fallback price');
    return fallback;
  }

  /**
   * USER-FACING ENDPOINTS
   */

  /**
   * Get active plans with pricing based on user's location
   */
  async getActivePlans(user: User) {
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

    const countryCode = userWithLocation?.currentCity?.country?.code;
    const currency = userWithLocation?.currentCity?.country?.currency;

    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        prices: {
          where: {
            isActive: true,
          },
          orderBy: {
            countryCode: 'asc',
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const plansWithPricing = plans.map((plan) => {
      const price = this.getBestPrice(plan.prices, countryCode);

      return {
        ...plan,
        currentPrice: price?.amount || plan.price,
        currentCurrency: price?.currency || plan.currency,
        selectedPrice: price,
        userLocation: {
          currency,
          countryCode,
          cityId: userWithLocation?.currentCityId,
          cityName: userWithLocation?.currentCity?.name,
          countryName: userWithLocation?.currentCity?.country?.name,
        },
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

    const countryCode = userWithLocation?.currentCity?.country?.code;
    const currency = userWithLocation?.currentCity?.country?.currency;

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: [{ countryCode: 'asc' }, { currency: 'asc' }],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const price = this.getBestPrice(plan.prices, countryCode);

    return {
      success: true,
      data: {
        ...plan,
        currentPrice: price?.amount || plan.price,
        currentCurrency: price?.currency || plan.currency,
        selectedPrice: price,
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
   * USER SUBSCRIPTIONS
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
        plan: {
          include: {
            prices: true,
          },
        },
        transaction: {
          select: {
            id: true,
            externalId: true,
            amount: true,
            status: true,
            createdAt: true,
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
        status: SubscriptionStatus.ACTIVE,
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
      this.prisma.userSubscription.findMany({
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
              externalId: true,
              amount: true,
              status: true,
              createdAt: true,
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

  async getSubscriptionById(subscriptionId: string, userId: string) {
    const subscription = await this.prisma.userSubscription.findFirst({
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

  /**
   * ADMIN SUBSCRIPTIONS MANAGEMENT
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
              externalId: true,
              amount: true,
              status: true,
              createdAt: true,
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
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
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
              prices: true,
            },
          },
          transaction: {
            select: {
              id: true,
              externalId: true,
              amount: true,
              status: true,
              createdAt: true,
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

    const subscriptions = await this.prisma.userSubscription.findMany({
      where: { id: { in: subscriptionIds } },
      include: {
        plan: true,
      },
    });

    if (subscriptions.length !== subscriptionIds.length) {
      throw new BadRequestException('Some subscription IDs are invalid');
    }

    let result;

    switch (action) {
      case BulkSubscriptionActionType.CANCEL:
        result = await this.prisma.userSubscription.updateMany({
          where: { id: { in: subscriptionIds } },
          data: {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
        this.logger.log(`Bulk cancelled ${result.count} subscriptions`);
        break;

      case BulkSubscriptionActionType.ACTIVATE:
        const pendingIds = subscriptions
          .filter((s: any) => s.status === SubscriptionStatus.PENDING)
          .map((s: any) => s.id);

        if (pendingIds.length === 0) {
          throw new BadRequestException('No pending subscriptions to activate');
        }

        for (const sub of subscriptions) {
          if (sub.status === 'PENDING') {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(
              endDate.getMonth() + (sub as any).plan.durationInMonths,
            );

            await this.prisma.userSubscription.update({
              where: { id: sub.id },
              data: {
                status: 'ACTIVE',
                startDate,
                endDate,
              },
            });
          }
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
    if (planId) where.planId = planId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
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
            externalId: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions;
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
