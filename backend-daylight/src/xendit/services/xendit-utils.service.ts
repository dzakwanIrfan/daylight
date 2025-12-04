import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

@Injectable()
export class XenditUtilsService {
  private readonly logger = new Logger(XenditUtilsService.name);

  constructor(private readonly configService: ConfigService) {}

  private getAuthHeader() {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    if (!secretKey) {
      throw new Error('XENDIT_SECRET_KEY is not configured');
    }
    return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
  }

  private getCommonHeaders() {
    return {
      Authorization: this.getAuthHeader(),
      'Content-Type': 'application/json',
      'api-version': '2024-11-11',
    };
  }

  async makeXenditRequest<T = any>(payload: any): Promise<T> {
    try {
      this.logger.log('Making Xendit API request', {
        channel: payload.channel_code,
        amount: payload.request_amount,
      });

      const response = await axios.post(
        'https://api.xendit.co/v3/payment_requests',
        payload,
        {
          headers: this.getCommonHeaders(),
        },
      );

      this.logger.log('Xendit API request successful', {
        payment_request_id: response.data.payment_request_id,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Xendit API request failed', {
        error: error instanceof AxiosError ? error.response?.data : error,
      });

      if (error instanceof AxiosError && error.response) {
        throw new Error(
          `Xendit API Error: ${error.response.data.message || error.response.statusText}`,
        );
      }

      throw error;
    }
  }

  /**
   * Verify webhook signature from Xendit
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookToken: string,
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookToken)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }
}
