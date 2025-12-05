import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  Event,
  User,
  SubscriptionPlan,
  PaymentMethodType,
  PaymentMethod,
  TransactionStatus,
  Prisma,
} from '@prisma/client';
import {
  CreateXenditPaymentDto,
  ItemType,
} from './dto/create-xendit-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { XenditUtilsService } from './services/xendit-utils.service';
import { XenditFeeCalculatorService } from './services/xendit-fee-calculator.service';
import { XenditPayloadBuilderService } from './services/xendit-payload-builder.service';
import { XenditResponseParserService } from './services/xendit-response-parser.service';
import {
  CreatePaymentResponse,
  XenditPaymentResponse,
  PaymentAction,
} from './dto/payment-response.dto';
import { XenditWebhookPayload } from './dto/xendit-webhook-payload.dto';
import { QueryXenditTransactionsDto } from './dto/query-xendit-transactions.dto';
import { XenditPaymentGateway } from './xendit-payment.gateway';

@Injectable()
export class XenditService {
  private readonly logger = new Logger(XenditService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly xenditUtilsService: XenditUtilsService,
    private readonly feeCalculator: XenditFeeCalculatorService,
    private readonly payloadBuilder: XenditPayloadBuilderService,
    private readonly responseParser: XenditResponseParserService,
    @Inject(forwardRef(() => XenditPaymentGateway))
    private readonly paymentGateway: XenditPaymentGateway,
  ) {}

  async createXenditPayment(
    user: User,
    data: CreateXenditPaymentDto,
  ): Promise<CreatePaymentResponse> {
    // 1. Validasi dan ambil item (Event atau Subscription)
    const item = await this.getItemByType(data.type, data.itemId);
    let amount: number;

    // Tentukan amount berdasarkan tipe item
    if (data.type === ItemType.EVENT) {
      amount = (item as Event).price;
    } else if (data.type === ItemType.SUBSCRIPTION) {
      // Untuk subscription, ambil harga berdasarkan country user
      const userWithLocation = await this.prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          currentCity: {
            include: {
              country: true,
            },
          },
        },
      });

      if (!userWithLocation?.currentCity?.country) {
        throw new BadRequestException(
          'User must have a current city to purchase subscription',
        );
      }

      const subscriptionPlan =
        await this.prismaService.subscriptionPlan.findUnique({
          where: { id: data.itemId },
          include: {
            prices: {
              where: {
                countryCode: userWithLocation.currentCity.country.code,
                isActive: true,
              },
            },
          },
        });

      if (!subscriptionPlan) {
        throw new NotFoundException('Subscription plan not found');
      }

      // Ambil harga sesuai country user
      const priceForCountry = subscriptionPlan.prices.find(
        (p) => p.countryCode === userWithLocation.currentCity!.country.code,
      );

      if (!priceForCountry) {
        throw new BadRequestException(
          `Subscription not available in your country (${userWithLocation.currentCity.country.name})`,
        );
      }

      amount = priceForCountry.amount;
    } else {
      amount = (item as any).price;
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid item price');
    }

    // 2. Validasi payment method
    const paymentMethod = await this.getPaymentMethod(data.paymentMethodId);

    // 3. Validasi user country match dengan payment method
    await this.validateUserCountry(user, paymentMethod);

    // 4. Hitung fee dan final amount
    const feeCalculation = this.feeCalculator.getFormattedFeeInfo(
      amount,
      paymentMethod,
    );

    if (!feeCalculation.isValid) {
      throw new BadRequestException(feeCalculation.error);
    }

    // 5. Buat payload sesuai tipe payment method
    const payload = this.buildPaymentPayload(
      user,
      Math.ceil(feeCalculation.feeInfo!.finalAmount.toNumber()),
      paymentMethod,
      data,
    );

    // 6. Request ke Xendit
    const xenditResponse: XenditPaymentResponse =
      await this.xenditUtilsService.makeXenditRequest(payload);

    // 7. Parse response
    const paymentInfo = this.responseParser.extractPaymentInfo(xenditResponse);

    // 8. Simpan transaction ke database (termasuk actions)
    const transaction = await this.saveTransaction(
      user,
      data,
      paymentMethod,
      feeCalculation.feeInfo!,
      xenditResponse,
      paymentInfo,
    );

    this.logger.log('Payment created successfully', {
      transactionId: transaction.id,
      type: data.type,
      itemId: data.itemId,
      amount: amount,
      finalAmount: feeCalculation.feeInfo!.finalAmount.toNumber(),
    });

    // 9. Return response
    return {
      transaction: {
        id: transaction.id,
        externalId: transaction.externalId,
        amount: transaction.amount.toNumber(),
        totalFee: transaction.totalFee.toNumber(),
        finalAmount: transaction.finalAmount.toNumber(),
        status: transaction.status,
        paymentUrl: paymentInfo.paymentUrl,
        paymentCode:
          paymentInfo.paymentCode || paymentInfo.virtualAccountNumber,
        qrString: paymentInfo.qrString,
        virtualAccountNumber: paymentInfo.virtualAccountNumber,
        actions: transaction.actions?.map((action) => ({
          type: action.type,
          descriptor: action.descriptor,
          value: action.value,
        })),
      },
      xenditResponse,
    };
  }

  private async getItemByType(
    type: ItemType,
    itemId: string,
  ): Promise<Event | SubscriptionPlan> {
    let item: Event | SubscriptionPlan | null = null;

    if (type === ItemType.EVENT) {
      item = await this.prismaService.event.findUnique({
        where: { id: itemId, isActive: true },
      });

      if (!item) {
        throw new NotFoundException('Event not found or inactive');
      }
    } else if (type === ItemType.SUBSCRIPTION) {
      item = await this.prismaService.subscriptionPlan.findUnique({
        where: { id: itemId, isActive: true },
        include: {
          prices: true,
        },
      });

      if (!item) {
        throw new NotFoundException('Subscription plan not found or inactive');
      }
    }

    return item!;
  }

  private async getPaymentMethod(
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.prismaService.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
        isActive: true,
      },
      include: {
        country: true,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found or inactive');
    }

    return paymentMethod;
  }

  private async validateUserCountry(
    user: User,
    paymentMethod: PaymentMethod,
  ): Promise<void> {
    if (!user.currentCityId) {
      throw new BadRequestException(
        'User must have a current city to make payment',
      );
    }

    const userCity = await this.prismaService.city.findUnique({
      where: { id: user.currentCityId },
      include: { country: true },
    });

    if (!userCity) {
      throw new BadRequestException('User city not found');
    }

    // Validasi currency match dengan country
    if (userCity.country.code !== paymentMethod.countryCode) {
      throw new BadRequestException(
        `Payment method ${paymentMethod.name} is not available in ${userCity.country.name}`,
      );
    }
  }

  private buildPaymentPayload(
    user: User,
    finalAmount: number,
    paymentMethod: PaymentMethod,
    data: CreateXenditPaymentDto,
  ): any {
    const options = {
      user,
      amount: finalAmount,
      paymentMethod,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      description: this.generatePaymentDescription(data.type, data.itemId),
    };

    switch (paymentMethod.type) {
      case PaymentMethodType.EWALLET:
        return this.payloadBuilder.buildEwalletPayload(options);

      case PaymentMethodType.QR_CODE:
        return this.payloadBuilder.buildQRCodePayload(options);

      case PaymentMethodType.BANK_TRANSFER:
        return this.payloadBuilder.buildVAPayload(options);

      case PaymentMethodType.OVER_THE_COUNTER:
        return this.payloadBuilder.buildOverTheCounterPayload(options);

      default:
        throw new BadRequestException(
          `Unsupported payment method type: ${paymentMethod.type}`,
        );
    }
  }

  private generatePaymentDescription(type: ItemType, itemId: string): string {
    if (type === ItemType.SUBSCRIPTION) {
      return `DayLight Subscription Payment #${itemId.substring(0, 8)}`;
    }
    return `DayLight Event Payment #${itemId.substring(0, 8)}`;
  }

  /**
   * Simpan transaction beserta actions ke database
   */
  private async saveTransaction(
    user: User,
    data: CreateXenditPaymentDto,
    paymentMethod: PaymentMethod,
    feeInfo: any,
    xenditResponse: XenditPaymentResponse,
    paymentInfo: any,
  ) {
    const transactionData: Prisma.TransactionCreateInput = {
      user: {
        connect: { id: user.id },
      },
      paymentMethod: {
        connect: { id: paymentMethod.id },
      },
      externalId: xenditResponse.reference_id,
      status: TransactionStatus.PENDING,
      amount: feeInfo.amount,
      totalFee: feeInfo.totalFee,
      finalAmount: feeInfo.finalAmount,
      paymentUrl: paymentInfo.paymentUrl || null,
    };

    // Connect event jika type EVENT
    if (data.type === ItemType.EVENT) {
      transactionData.event = {
        connect: { id: data.itemId },
      };
    }

    // Simpan actions jika ada
    if (xenditResponse.actions && xenditResponse.actions.length > 0) {
      transactionData.actions = {
        create: xenditResponse.actions.map((action: PaymentAction) => ({
          type: action.type,
          descriptor: action.descriptor,
          value: action.value,
        })),
      };
    }

    const transaction = await this.prismaService.transaction.create({
      data: transactionData,
      include: {
        actions: true,
      },
    });

    // Jika type SUBSCRIPTION, buat pending subscription
    if (data.type === ItemType.SUBSCRIPTION) {
      await this.createPendingSubscription(
        user.id,
        data.itemId,
        transaction.id,
      );
    }

    this.logger.log('Transaction created with actions', {
      transactionId: transaction.id,
      externalId: transaction.externalId,
      amount: transaction.finalAmount.toNumber(),
      actionsCount: transaction.actions?.length || 0,
      type: data.type,
    });

    return transaction;
  }

  /**
   * Create pending subscription saat transaction dibuat
   */
  private async createPendingSubscription(
    userId: string,
    planId: string,
    transactionId: string,
  ) {
    const existingSubscription =
      await this.prismaService.userSubscription.findFirst({
        where: {
          userId,
          transactionId,
        },
      });

    if (existingSubscription) {
      this.logger.warn('Subscription already exists for this transaction', {
        subscriptionId: existingSubscription.id,
        transactionId,
      });
      return existingSubscription;
    }

    const subscription = await this.prismaService.userSubscription.create({
      data: {
        userId,
        planId,
        transactionId,
        status: 'PENDING',
      },
    });

    this.logger.log('Created pending subscription', {
      subscriptionId: subscription.id,
      userId,
      planId,
      transactionId,
    });

    return subscription;
  }

  /**
   * Handle webhook dari Xendit
   */
  async handleWebhook(webhookPayload: XenditWebhookPayload): Promise<void> {
    const { event, data } = webhookPayload;

    this.logger.log('Processing Xendit webhook', {
      event,
      reference_id: data.reference_id,
      status: data.status,
    });

    // Cari transaction berdasarkan reference_id
    const transaction = await this.prismaService.transaction.findUnique({
      where: { externalId: data.reference_id },
      include: {
        event: true,
        user: true,
        actions: true,
        userSubscription: true,
      },
    });

    if (!transaction) {
      this.logger.warn('Transaction not found for webhook', {
        reference_id: data.reference_id,
      });
      return;
    }

    // Update transaction status berdasarkan event
    await this.updateTransactionStatus(transaction, event, data);
  }

  private async updateTransactionStatus(
    transaction: any,
    event: string,
    data: any,
  ): Promise<void> {
    let newStatus: TransactionStatus;

    switch (event) {
      case 'payment.capture':
      case 'payment.authorization':
        newStatus = TransactionStatus.PAID;
        await this.handleSuccessfulPayment(transaction);
        break;

      case 'payment.failure':
        newStatus = TransactionStatus.FAILED;
        await this.handleFailedPayment(transaction);
        break;

      case 'payment.expired':
        newStatus = TransactionStatus.EXPIRED;
        await this.handleExpiredPayment(transaction);
        break;

      default:
        this.logger.warn('Unknown webhook event', { event });
        return;
    }

    // Update transaction
    const updatedTransaction = await this.prismaService.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        event: true,
        userSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    this.logger.log('Transaction status updated', {
      transactionId: transaction.id,
      oldStatus: transaction.status,
      newStatus,
    });

    // Emit WebSocket event
    this.emitPaymentStatusUpdate(updatedTransaction, newStatus);
  }

  private emitPaymentStatusUpdate(
    transaction: any,
    newStatus: TransactionStatus,
  ): void {
    const eventData = {
      transactionId: transaction.id,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      event: transaction.event,
      subscription: transaction.userSubscription,
      amount: transaction.finalAmount.toNumber(),
    };

    switch (newStatus) {
      case TransactionStatus.PAID:
        this.paymentGateway.emitPaymentSuccess(
          transaction.id,
          transaction.userId,
          eventData,
        );
        break;
      case TransactionStatus.FAILED:
        this.paymentGateway.emitPaymentFailed(
          transaction.id,
          transaction.userId,
          eventData,
        );
        break;
      case TransactionStatus.EXPIRED:
        this.paymentGateway.emitPaymentExpired(
          transaction.id,
          transaction.userId,
        );
        break;
      default:
        this.paymentGateway.emitPaymentStatusUpdate(transaction.id, eventData);
    }
  }

  private async handleSuccessfulPayment(transaction: any): Promise<void> {
    // Jika ada event, update currentParticipants
    if (transaction.eventId) {
      await this.prismaService.event.update({
        where: { id: transaction.eventId },
        data: {
          currentParticipants: {
            increment: 1,
          },
        },
      });

      this.logger.log('Event participants updated', {
        eventId: transaction.eventId,
      });
    }

    // Handle subscription jika ada
    if (transaction.userSubscription) {
      await this.activateSubscription(transaction.userSubscription.id);
    }
  }

  private async handleFailedPayment(transaction: any): Promise<void> {
    // Cancel subscription jika ada
    if (transaction.userSubscription) {
      await this.prismaService.userSubscription.update({
        where: { id: transaction.userSubscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          metadata: {
            reason: 'Payment failed',
          },
        },
      });

      this.logger.log('Subscription cancelled due to payment failure', {
        subscriptionId: transaction.userSubscription.id,
      });
    }
  }

  private async handleExpiredPayment(transaction: any): Promise<void> {
    // Cancel subscription jika ada
    if (transaction.userSubscription) {
      await this.prismaService.userSubscription.update({
        where: { id: transaction.userSubscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          metadata: {
            reason: 'Payment expired',
          },
        },
      });

      this.logger.log('Subscription cancelled due to payment expiry', {
        subscriptionId: transaction.userSubscription.id,
      });
    }
  }

  /**
   * Activate subscription when payment is successful
   */
  private async activateSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.prismaService.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      this.logger.error('Subscription not found for activation', {
        subscriptionId,
      });
      return;
    }

    if (subscription.status === 'ACTIVE') {
      this.logger.warn('Subscription already active', { subscriptionId });
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + subscription.plan.durationInMonths);

    await this.prismaService.userSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate,
        endDate,
      },
    });

    this.logger.log('Subscription activated', {
      subscriptionId,
      userId: subscription.userId,
      planId: subscription.planId,
      startDate,
      endDate,
    });
  }

  /**
   * Get available payment methods by country
   */
  async getAvailablePaymentMethods(user: User): Promise<PaymentMethod[]> {
    const userWithLocation = await this.prismaService.user.findUnique({
      where: { id: user.id },
      include: {
        currentCity: {
          include: {
            country: true,
          },
        },
      },
    });

    if (!userWithLocation?.currentCity?.country) {
      throw new BadRequestException('User country information is missing');
    }

    return await this.prismaService.paymentMethod.findMany({
      where: {
        countryCode: userWithLocation.currentCity.country.code,
        isActive: true,
      },
      include: {
        country: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Calculate fee preview for user
   */
  async calculateFeePreview(
    amount: number,
    paymentMethodId: string,
  ): Promise<any> {
    const paymentMethod = await this.getPaymentMethod(paymentMethodId);
    const feeInfo = this.feeCalculator.getFormattedFeeInfo(
      amount,
      paymentMethod,
    );

    if (!feeInfo.isValid) {
      throw new BadRequestException(feeInfo.error);
    }

    return {
      paymentMethod: {
        id: paymentMethod.id,
        name: paymentMethod.name,
        code: paymentMethod.code,
        type: paymentMethod.type,
      },
      calculation: feeInfo.feeInfo!.breakdown,
    };
  }

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
              venue: true,
              city: true,
            },
          },
          userSubscription: {
            include: {
              plan: true,
            },
          },
          actions: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prismaService.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions,
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
}
