import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { PaymentStatus, Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import axios from 'axios';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { PaymentGateway } from './payment.gateway';

@Injectable()
export class PaymentService {
  private readonly tripayApiKey: string;
  private readonly tripayPrivateKey: string;
  private readonly tripayMerchantCode: string;
  private readonly tripayBaseUrl: string;
  private readonly tripayCallbackUrl: string;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    private paymentMethodsService: PaymentMethodsService,
    private paymentGateway: PaymentGateway,
  ) {
    this.tripayApiKey = this.getRequiredConfig('TRIPAY_API_KEY');
    this.tripayPrivateKey = this.getRequiredConfig('TRIPAY_PRIVATE_KEY');
    this.tripayMerchantCode = this.getRequiredConfig('TRIPAY_MERCHANT_CODE');
    this.tripayBaseUrl = this.getRequiredConfig('TRIPAY_BASE_URL');
    this.tripayCallbackUrl = this.getRequiredConfig('TRIPAY_CALLBACK_URL');
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      this.logger.error(`Missing configuration for ${key}`);
      throw new InternalServerErrorException(`Server configuration missing: ${key}`);
    }
    return value;
  }

  /**
   * Generate unique merchant reference
   */
  private generateMerchantRef(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Generate signature for Tripay request
   */
  private generateSignature(merchantRef: string, amount: number): string {
    const data = this.tripayMerchantCode + merchantRef + amount;
    return crypto
      .createHmac('sha256', this.tripayPrivateKey)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify callback signature from Tripay
   */
  private verifyCallbackSignature(
    callbackData: PaymentCallbackDto,
    signature: string,
  ): boolean {
    try {
      // Create JSON string from callback data (sort by key)
      const json = JSON.stringify(callbackData);

      // Generate HMAC SHA256
      const calculatedSignature = crypto
        .createHmac('sha256', this.tripayPrivateKey)
        .update(json)
        .digest('hex');

      return calculatedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get payment channels
   */
  async getPaymentChannels() {
    try {
      return this.paymentMethodsService.getActivePaymentMethods();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch payment channels',
      );
    }
  }

  /**
   * Calculate payment fee
   */
  async calculateFee(amount: number, code?: string) {
    if (code) {
      return this.paymentMethodsService.calculateFee(code, amount);
    }

    const methods = await this.paymentMethodsService.getActivePaymentMethods();
    const calculations = await Promise.all(
      methods.flat.map(async (method) => {
        try {
          const result = await this.paymentMethodsService.calculateFee(
            method.code,
            amount,
          );
          return result.data;
        } catch (error) {
          return null;
        }
      }),
    );

    return {
      success: true,
      data: calculations.filter((c) => c !== null),
    };
  }

  /**
   * Create payment transaction
   */
  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const {
      eventId,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      quantity,
    } = createPaymentDto;

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

    if (event.currentParticipants + quantity > event.maxParticipants) {
      throw new BadRequestException('Not enough slots available');
    }

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate payment method
    const methodData = await this.paymentMethodsService.getPaymentMethodByCode(
      paymentMethod,
    );

    if (!methodData.data.isActive) {
      throw new BadRequestException('Payment method is not available');
    }

    // Calculate amount
    const amount = event.price * quantity;
    const merchantRef = this.generateMerchantRef();

    // Calculate fee
    const feeCalculation = await this.paymentMethodsService.calculateFee(
      paymentMethod,
      amount,
    );

    const feeMerchant = feeCalculation.data.fee.merchant.total;
    const feeCustomer = feeCalculation.data.fee.customer.total;
    const totalFee = feeCalculation.data.fee.total;
    const finalAmount = feeCalculation.data.finalAmount;

    // Generate signature
    const signature = this.generateSignature(merchantRef, finalAmount);

    // Prepare order items
    const orderItems = [
      {
        sku: event.id,
        name: event.title,
        price: event.price,
        quantity: quantity,
        subtotal: amount,
        product_url: `${this.configService.get('FRONTEND_URL')}/events/${event.slug}`,
      },
    ];

    // Create transaction with Tripay
    try {
      const tripayResponse = await axios.post(
        `${this.tripayBaseUrl}/transaction/create`,
        {
          method: paymentMethod,
          merchant_ref: merchantRef,
          amount: finalAmount,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || undefined,
          order_items: orderItems,
          callback_url: this.tripayCallbackUrl,
          return_url: `${this.configService.get('FRONTEND_URL')}/my-events`,
          expired_time: Math.floor(Date.now() / 1000) + 24 * 3600,
          signature: signature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.tripayApiKey}`,
          },
        },
      );

      const tripayData = tripayResponse.data.data;

      // Save transaction
      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          eventId,
          tripayReference: tripayData.reference,
          merchantRef: merchantRef,
          paymentMethodCode: paymentMethod,
          paymentMethod: tripayData.payment_method,
          paymentName: tripayData.payment_name,
          paymentStatus: PaymentStatus.PENDING,
          amount: amount,
          feeMerchant: feeMerchant,
          feeCustomer: feeCustomer,
          totalFee: totalFee,
          amountReceived: tripayData.amount_received,
          payCode: tripayData.pay_code,
          payUrl: tripayData.pay_url,
          checkoutUrl: tripayData.checkout_url,
          qrString: tripayData.qr_string,
          qrUrl: tripayData.qr_url,
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          expiredAt: new Date(tripayData.expired_time * 1000),
          instructions: tripayData.instructions,
          orderItems: orderItems,
        },
        include: {
          event: true,
        },
      });

      // Emit WebSocket notification
      try {
        this.paymentGateway.emitPaymentUpdateToUser(userId, {
          type: 'payment:created',
          transaction: {
            id: transaction.id,
            status: transaction.paymentStatus,
            amount: transaction.amount,
            expiredAt: transaction.expiredAt,
          },
          message: 'Pembayaran berhasil dibuat',
        });
      } catch (wsError) {
        this.logger.error(`WebSocket error: ${wsError.message}`);
      }

      // Send email
      await this.emailService.sendPaymentCreatedEmail(
        customerEmail,
        customerName,
        transaction,
        event,
      );

      return {
        success: true,
        message: 'Payment created successfully',
        data: transaction,
      };
    } catch (error) {
      this.logger.error('Tripay API Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || 'Failed to create payment',
      );
    }
  }

  /**
   * Handle payment callback from Tripay
   * CRITICAL: This is the main callback handler
   */
  async handleCallback(
    callbackData: PaymentCallbackDto,
    signature: string,
  ) {
    this.logger.log('=== CALLBACK RECEIVED ===');
    this.logger.log(`Reference: ${callbackData.reference}`);
    this.logger.log(`Merchant Ref: ${callbackData.merchant_ref}`);
    this.logger.log(`Status: ${callbackData.status}`);
    this.logger.log(`Signature: ${signature}`);

    // Verify signature
    const isValid = this.verifyCallbackSignature(callbackData, signature);
    if (!isValid) {
      this.logger.error('Invalid callback signature');
      throw new UnauthorizedException('Invalid signature');
    }

    this.logger.log('✅ Signature verified');

    const { merchant_ref, reference, status, paid_at } = callbackData;

    // Find transaction
    const transaction = await this.prisma.transaction.findUnique({
      where: { merchantRef: merchant_ref },
      include: { event: true, user: true },
    });

    if (!transaction) {
      this.logger.error(`Transaction not found: ${merchant_ref}`);
      throw new NotFoundException('Transaction not found');
    }

    this.logger.log(`Found transaction: ${transaction.id}`);

    // Map Tripay status to our PaymentStatus enum
    let mappedStatus: PaymentStatus;
    switch (status) {
      case 'PAID':
        mappedStatus = PaymentStatus.PAID;
        break;
      case 'EXPIRED':
        mappedStatus = PaymentStatus.EXPIRED;
        break;
      case 'FAILED':
        mappedStatus = PaymentStatus.FAILED;
        break;
      case 'REFUND':
        mappedStatus = PaymentStatus.REFUNDED;
        break;
      default:
        mappedStatus = PaymentStatus.PENDING;
    }

    // Prepare update data
    const updateData: Prisma.TransactionUpdateInput = {
      paymentStatus: mappedStatus,
      callbackData: callbackData as any,
      updatedAt: new Date(),
    };

    if (status === 'PAID' && paid_at) {
      updateData.paidAt = new Date(paid_at * 1000);

      // Update event participants
      const orderItems = transaction.orderItems as any[];
      await this.prisma.event.update({
        where: { id: transaction.eventId },
        data: {
          currentParticipants: {
            increment: orderItems[0]?.quantity || 1,
          },
        },
      });

      this.logger.log('✅ Event participants updated');
    }

    // Update transaction
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: updateData,
      include: { event: true, user: true },
    });

    this.logger.log('✅ Transaction updated');

    // Emit WebSocket events
    try {
      if (status === 'PAID') {
        this.paymentGateway.emitPaymentSuccess(
          transaction.id,
          transaction.userId,
          {
            event: updatedTransaction.event,
            amount: transaction.amount,
            paidAt: updatedTransaction.paidAt,
          },
        );
      } else if (status === 'EXPIRED') {
        this.paymentGateway.emitPaymentExpired(
          transaction.id,
          transaction.userId,
        );
      } else if (status === 'FAILED') {
        this.paymentGateway.emitPaymentFailed(
          transaction.id,
          transaction.userId,
          { status },
        );
      }

      this.paymentGateway.emitPaymentStatusUpdate(transaction.id, {
        status: updatedTransaction.paymentStatus,
        paidAt: updatedTransaction.paidAt,
        updatedAt: updatedTransaction.updatedAt,
      });

      this.logger.log('✅ WebSocket events emitted');
    } catch (wsError) {
      this.logger.error(`WebSocket error: ${wsError.message}`);
    }

    // Send email notifications
    try {
      if (status === 'PAID') {
        await this.emailService.sendPaymentSuccessEmail(
          transaction.customerEmail,
          transaction.customerName,
          updatedTransaction,
          updatedTransaction.event,
        );
      } else if (status === 'EXPIRED') {
        await this.emailService.sendPaymentExpiredEmail(
          transaction.customerEmail,
          transaction.customerName,
          updatedTransaction,
          updatedTransaction.event,
        );
      } else if (status === 'FAILED') {
        await this.emailService.sendPaymentFailedEmail(
          transaction.customerEmail,
          transaction.customerName,
          updatedTransaction,
          updatedTransaction.event,
        );
      }
    } catch (emailError) {
      this.logger.error(`Email error: ${emailError.message}`);
    }

    return {
      success: true,
      message: 'Callback processed successfully',
    };
  }

  /**
   * Get transaction detail
   */
  async getTransactionDetail(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: userId,
      },
      include: {
        event: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    try {
      const response = await axios.get(
        `${this.tripayBaseUrl}/transaction/detail`,
        {
          headers: {
            Authorization: `Bearer ${this.tripayApiKey}`,
          },
          params: {
            reference: transaction.tripayReference,
          },
        },
      );

      const tripayData = response.data.data;

      if (tripayData.status !== transaction.paymentStatus) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: tripayData.status,
            paidAt: tripayData.paid_at
              ? new Date(tripayData.paid_at * 1000)
              : null,
          },
        });
      }

      return {
        success: true,
        data: {
          ...transaction,
          latestStatus: tripayData.status,
          instructions: tripayData.instructions,
        },
      };
    } catch (error) {
      return {
        success: true,
        data: transaction,
      };
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string, queryDto: QueryTransactionsDto) {
    const { page = 1, limit = 10, search, status, eventId, sortOrder } = queryDto;

    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (search) {
      where.OR = [
        { merchantRef: { contains: search, mode: 'insensitive' } },
        { tripayReference: { contains: search, mode: 'insensitive' } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.paymentStatus = status;
    if (eventId) where.eventId = eventId;

    const skip = (page - 1) * limit;
    const take = limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              eventDate: true,
              venue: true,
              city: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
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

  /**
   * Get all transactions (Admin)
   */
  async getAllTransactions(queryDto: QueryTransactionsDto) {
    const { page = 1, limit = 10, search, status, eventId, sortOrder } = queryDto;

    const where: Prisma.TransactionWhereInput = {};

    if (search) {
      where.OR = [
        { merchantRef: { contains: search, mode: 'insensitive' } },
        { tripayReference: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.paymentStatus = status;
    if (eventId) where.eventId = eventId;

    const skip = (page - 1) * limit;
    const take = limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              eventDate: true,
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
        },
      }),
      this.prisma.transaction.count({ where }),
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

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: userId,
      },
      include: {
        event: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    try {
      const response = await axios.get(
        `${this.tripayBaseUrl}/transaction/detail`,
        {
          headers: {
            Authorization: `Bearer ${this.tripayApiKey}`,
          },
          params: {
            reference: transaction.tripayReference,
          },
        },
      );

      const tripayData = response.data.data;

      if (tripayData.status !== transaction.paymentStatus) {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: tripayData.status,
            paidAt: tripayData.paid_at
              ? new Date(tripayData.paid_at * 1000)
              : null,
          },
        });

        try {
          this.paymentGateway.emitPaymentStatusUpdate(transaction.id, {
            status: tripayData.status,
            paidAt: tripayData.paid_at
              ? new Date(tripayData.paid_at * 1000)
              : null,
            updatedAt: new Date(),
          });

          if (tripayData.status === PaymentStatus.PAID) {
            this.paymentGateway.emitPaymentSuccess(transaction.id, userId, {
              event: transaction.event,
              amount: transaction.amount,
              paidAt: new Date(tripayData.paid_at * 1000),
            });
          }
        } catch (wsError) {
          this.logger.error(`WebSocket error: ${wsError.message}`);
        }

        if (
          tripayData.status === 'PAID' &&
          transaction.paymentStatus !== 'PAID'
        ) {
          const orderItems = transaction.orderItems as any[];
          await this.prisma.event.update({
            where: { id: transaction.eventId },
            data: {
              currentParticipants: {
                increment: orderItems[0]?.quantity || 1,
              },
            },
          });
        }
      }

      return {
        success: true,
        status: tripayData.status,
        message: `Transaction status: ${tripayData.status}`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to check payment status');
    }
  }

  /**
   * Get payment statistics (Admin)
   */
  async getPaymentStatistics() {
    const [
      totalTransactions,
      paidTransactions,
      pendingTransactions,
      totalRevenue,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      this.prisma.transaction.count({
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      this.prisma.transaction.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { amountReceived: true },
      }),
      this.prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalTransactions,
        paidTransactions,
        pendingTransactions,
        failedTransactions: await this.prisma.transaction.count({
          where: { paymentStatus: PaymentStatus.FAILED },
        }),
        expiredTransactions: await this.prisma.transaction.count({
          where: { paymentStatus: PaymentStatus.EXPIRED },
        }),
        totalRevenue: totalRevenue._sum.amountReceived || 0,
      },
      recentTransactions,
    };
  }
}