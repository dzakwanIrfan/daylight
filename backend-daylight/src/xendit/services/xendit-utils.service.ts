import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class XenditUtilsService {
  constructor(private readonly configService: ConfigService) {}

  private getAuthHeader() {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
  }

  private getCommonHeaders() {
    return {
      'Authorization': this.getAuthHeader(),
      'Content-Type': 'application/json',
      'api-version': '2024-11-11',
    };
  }

  async makeXenditRequest(payload: any) {
    try {
      const response = await axios.post(
        "https://api.xendit.co/v3/payment_requests",
        {
          ...payload,
        },
        {
          headers: this.getCommonHeaders(),
        },
      );
      return response.data;
    } catch (error) {
        throw error.response;
    }
  }
}
