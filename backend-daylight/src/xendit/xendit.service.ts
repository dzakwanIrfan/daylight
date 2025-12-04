import { Injectable } from '@nestjs/common';
import {
  Event,
  User,
  SubscriptionPlan,
  PaymentMethodType,
  PaymentMethod,
  Transaction,
  Prisma,
  TransactionStatus,
} from '@prisma/client';
import { CreateXenditPaymentDto } from './dto/create-xendit-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { XenditUtilsService } from './services/xendit-utils.service';
import { RequestEwalletDto, ResponseEwalletDto } from './dto/ewallet.dto';
import { RequestQrCodetDto } from './dto/qrcode.dto';
import { RequestVAtDto } from './dto/va.dto';
import { RequestOverTheCounterDto } from './dto/overthecounter.dto';

@Injectable()
export class XenditService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly xenditUtilsService: XenditUtilsService,
  ) {}

  async createXenditPayment(user: User, data: CreateXenditPaymentDto) {
    // Mencari harga item berdasarkan tipe dan ID
    let item: Event | SubscriptionPlan | null = null;

    if (data.type === 'EVENT') {
      item = await this.prismaService.event.findUnique({
        where: { id: data.itemId, isActive: true },
      });
    } else if (data.type === 'SUBSCRIPTION') {
      item = await this.prismaService.subscriptionPlan.findUnique({
        where: { id: data.itemId, isActive: true },
      });
    }

    if (item?.price === null || item?.price === undefined) {
      throw new Error('Item not found or has no price');
    }
    const amount = item.price;

    // Mencari metode pembayaran berdasarkan ID
    const paymentMethod = await this.prismaService.paymentMethod.findUnique({
      where: {
        id: data.paymentMethodId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found or inactive');
    }

    let response: ResponseEwalletDto;
    // Mencari service yang cocok dengan type metode pembayaran
    switch (paymentMethod?.type) {
      case PaymentMethodType.EWALLET:
        return await this.createEWalletPayment(
          user,
          amount,
          paymentMethod,
          data,
        );
        break;
      case PaymentMethodType.QR_CODE:
        return await this.createQRCodePayment(
          user,
          amount,
          paymentMethod,
          data,
        );
        break;
      case PaymentMethodType.BANK_TRANSFER:
        return await this.createVAPayment(user, amount, paymentMethod, data);
        break;
      case PaymentMethodType.OVER_THE_COUNTER:
        return await this.createOverTheCounterPayment(
          user,
          amount,
          paymentMethod,
          data,
        );
        break;
      default:
        throw new Error('Unsupported payment method type');
    }

    const transactionData = {
      userId: user.id,
      amount: new Prisma.Decimal(amount),
      paymentMethodId: paymentMethod!.id,
      status: TransactionStatus.PENDING,
      eventId: data.type === 'EVENT' ? data.itemId : null,
      externalId: response.reference_id,
      finalAmount: new Prisma.Decimal(amount),
      totalFee: new Prisma.Decimal(0),
      paymentUrl:
        response.actions?.find((action) => action.type === 'REDIRECT_URL')
          ?.value || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transaction = await this.prismaService.transaction.create({
      data: {
        ...transactionData,
      },
    });
  }

  async createEWalletPayment(
    user: User,
    amount: number,
    paymentMethod: PaymentMethod,
    data: CreateXenditPaymentDto,
  ) {
    const payload: RequestEwalletDto = {
      reference_id: `${user.id}+${Date.now()}`,
      request_amount: amount,
      country: paymentMethod.countryCode,
      currency: paymentMethod.currency,
      channel_code: paymentMethod.code,
      channel_properties: {
        success_return_url: 'http://localhost:30001/success',
        pending_return_url: 'http://localhost:30001/pending',
        failure_return_url: 'http://localhost:30001/failure',
        cancel_return_url: 'http://localhost:30001/cancel',
      },
      description: 'Pembayaran untuk user ' + user.email,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: `${user.id}+${Date.now()}`,
        email: data.customerEmail,
        individual_detail: {
          given_names: user.firstName || data.customerName,
        },
      },
      type: 'PAY',
    };
    return await this.xenditUtilsService.makeXenditRequest(payload);
  }

  private getCountryOffsetHours(countryCode: string): number {
    switch (countryCode) {
      case 'ID':
        return 7; // WIB (UTC+7)
      case 'SG':
        return 8; // Singapore (UTC+8)
      case 'TH':
        return 7; // Thailand (UTC+7)
      // Tambah negara lain sesuai kebutuhan
      default:
        return 0; // UTC
    }
  }

  async createQRCodePayment(
    user: User,
    amount: number,
    paymentMethod: PaymentMethod,
    data: CreateXenditPaymentDto,
  ) {
    const offsetHours = this.getCountryOffsetHours(paymentMethod.countryCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    expiresAt.setHours(expiresAt.getHours() + offsetHours);

    const payload: RequestQrCodetDto = {
      reference_id: `${user.id}+${Date.now()}`,
      request_amount: amount,
      country: paymentMethod.countryCode,
      currency: paymentMethod.currency,
      channel_code: paymentMethod.code,
      channel_properties: {
        expires_at: expiresAt.toISOString(),
      },
      description: 'Pembayaran untuk user ' + user.email,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: `${user.id}+${Date.now()}`,
        email: data.customerEmail,
        individual_detail: {
          given_names: user.firstName || data.customerName,
        },
      },
      type: 'PAY',
    };
    return await this.xenditUtilsService.makeXenditRequest(payload);
  }

  async createVAPayment(
    user: User,
    amount: number,
    paymentMethod: PaymentMethod,
    data: CreateXenditPaymentDto,
  ) {
    const payload: RequestVAtDto = {
      reference_id: `${user.id}+${Date.now()}`,
      request_amount: amount,
      country: paymentMethod.countryCode,
      currency: paymentMethod.currency,
      channel_code: paymentMethod.code,
      channel_properties: {
        display_name: data.customerName,
        description: 'Virtual Account for ' + user.email,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
      description: 'Pembayaran untuk user ' + user.email,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: `${user.id}+${Date.now()}`,
        email: data.customerEmail,
        individual_detail: {
          given_names: user.firstName || data.customerName,
        },
      },
      type: 'PAY',
    };
    return await this.xenditUtilsService.makeXenditRequest(payload);
  }

  async createOverTheCounterPayment(
    user: User,
    amount: number,
    paymentMethod: PaymentMethod,
    data: CreateXenditPaymentDto,
  ) {
    const offsetHours = this.getCountryOffsetHours(paymentMethod.countryCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    expiresAt.setHours(expiresAt.getHours() + offsetHours);

    const payload: RequestOverTheCounterDto = {
      reference_id: `${user.id}+${Date.now()}`,
      request_amount: amount,
      country: paymentMethod.countryCode,
      currency: paymentMethod.currency,
      channel_code: paymentMethod.code,
      channel_properties: {
        payer_name: data.customerName,
        expires_at: expiresAt.toISOString(),
      },
      description: 'Pembayaran untuk user ' + user.email,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: `${user.id}+${Date.now()}`,
        email: data.customerEmail,
        individual_detail: {
          given_names: user.firstName || data.customerName,
        },
      },
      type: 'PAY',
    };
    return await this.xenditUtilsService.makeXenditRequest(payload);
  }
}
