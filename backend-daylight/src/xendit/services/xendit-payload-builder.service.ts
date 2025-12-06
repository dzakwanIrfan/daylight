import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, User } from '@prisma/client';
import { RequestEwalletDto } from '../dto/ewallet.dto';
import { RequestQrCodetDto } from '../dto/qrcode.dto';
import { RequestVAtDto } from '../dto/va.dto';
import { RequestOverTheCounterDto } from '../dto/overthecounter.dto';

export interface PaymentPayloadOptions {
  user: User;
  amount: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  description: string;
  expiryMinutes?: number;
}

@Injectable()
export class XenditPayloadBuilderService {
  constructor(private readonly configService: ConfigService) { }

  private generateReferenceId(userId: string): string {
    return `DL-${userId}-${Date.now()}`;
  }

  private getCountryOffsetHours(countryCode: string): number {
    const offsets: Record<string, number> = {
      ID: 7, // WIB (UTC+7)
      SG: 8, // Singapore (UTC+8)
      TH: 7, // Thailand (UTC+7)
      MY: 8, // Malaysia (UTC+8)
      PH: 8, // Philippines (UTC+8)
      VN: 7, // Vietnam (UTC+7)
    };

    return offsets[countryCode] || 0;
  }

  private getExpiryTime(
    countryCode: string,
    minutes: number = 15,
  ): { expiresAt: string; offsetHours: number } {
    const offsetHours = this.getCountryOffsetHours(countryCode);
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    expiresAt.setHours(expiresAt.getHours() + offsetHours);

    return {
      expiresAt: expiresAt.toISOString(),
      offsetHours,
    };
  }

  private getReturnUrls() {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    return {
      success_return_url: `${frontendUrl}/payment/success`,
      pending_return_url: `${frontendUrl}/payment/pending`,
      failure_return_url: `${frontendUrl}/payment/failure`,
      cancel_return_url: `${frontendUrl}/payment/cancel`,
    };
  }

  buildEwalletPayload(options: PaymentPayloadOptions): RequestEwalletDto {
    const referenceId = this.generateReferenceId(options.user.id);

    return {
      reference_id: referenceId,
      request_amount: options.amount,
      country: options.paymentMethod.countryCode,
      currency: options.paymentMethod.currency,
      channel_code: options.paymentMethod.code,
      channel_properties: this.getReturnUrls(),
      description: options.description,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: referenceId,
        email: options.customerEmail,
        individual_detail: {
          given_names: options.customerName,
        },
      },
      type: 'PAY',
    };
  }

  buildQRCodePayload(options: PaymentPayloadOptions): RequestQrCodetDto {
    const referenceId = this.generateReferenceId(options.user.id);
    const { expiresAt } = this.getExpiryTime(
      options.paymentMethod.countryCode,
      options.expiryMinutes || 15,
    );

    return {
      reference_id: referenceId,
      request_amount: options.amount,
      country: options.paymentMethod.countryCode,
      currency: options.paymentMethod.currency,
      channel_code: options.paymentMethod.code,
      channel_properties: {
        expires_at: expiresAt,
      },
      description: options.description,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: referenceId,
        email: options.customerEmail,
        individual_detail: {
          given_names: options.customerName,
        },
      },
      type: 'PAY',
    };
  }

  buildVAPayload(options: PaymentPayloadOptions): RequestVAtDto {
    const referenceId = this.generateReferenceId(options.user.id);
    const { expiresAt } = this.getExpiryTime(
      options.paymentMethod.countryCode,
      options.expiryMinutes || 1440, // VA biasanya 24 jam
    );

    return {
      reference_id: referenceId,
      request_amount: options.amount,
      country: options.paymentMethod.countryCode,
      currency: options.paymentMethod.currency,
      channel_code: options.paymentMethod.code,
      channel_properties: {
        display_name: options.customerName,
        description: options.description,
        expires_at: expiresAt,
      },
      description: options.description,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: referenceId,
        email: options.customerEmail,
        individual_detail: {
          given_names: options.customerName,
        },
      },
      type: 'PAY',
    };
  }

  buildOverTheCounterPayload(
    options: PaymentPayloadOptions,
  ): RequestOverTheCounterDto {
    const referenceId = this.generateReferenceId(options.user.id);
    const { expiresAt } = this.getExpiryTime(
      options.paymentMethod.countryCode,
      options.expiryMinutes || 1440, // OTC biasanya 24 jam
    );

    return {
      reference_id: referenceId,
      request_amount: options.amount,
      country: options.paymentMethod.countryCode,
      currency: options.paymentMethod.currency,
      channel_code: options.paymentMethod.code,
      channel_properties: {
        payer_name: options.customerName,
        expires_at: expiresAt,
      },
      description: options.description,
      customer: {
        type: 'INDIVIDUAL',
        reference_id: referenceId,
        email: options.customerEmail,
        individual_detail: {
          given_names: options.customerName,
        },
      },
      type: 'PAY',
    };
  }
}
