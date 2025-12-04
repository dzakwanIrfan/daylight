import { Injectable } from '@nestjs/common';
import {
  XenditPaymentResponse,
  PaymentAction,
} from '../dto/payment-response.dto';

export interface ParsedPaymentInfo {
  paymentUrl?: string;
  paymentCode?: string;
  qrString?: string;
  virtualAccountNumber?: string;
}

@Injectable()
export class XenditResponseParserService {
  /**
   * Parse actions dari response Xendit untuk mendapatkan payment info
   */
  parsePaymentActions(actions?: PaymentAction[]): ParsedPaymentInfo {
    if (!actions || actions.length === 0) {
      return {};
    }

    const result: ParsedPaymentInfo = {};

    for (const action of actions) {
      switch (action.descriptor) {
        case 'WEB_URL':
          result.paymentUrl = action.value;
          break;
        case 'PAYMENT_CODE':
          result.paymentCode = action.value;
          break;
        case 'QR_STRING':
          result.qrString = action.value;
          break;
        case 'VIRTUAL_ACCOUNT_NUMBER':
          result.virtualAccountNumber = action.value;
          break;
      }
    }

    return result;
  }

  /**
   * Ekstrak informasi penting dari response Xendit
   */
  extractPaymentInfo(response: XenditPaymentResponse): ParsedPaymentInfo & {
    externalId: string;
    status: string;
  } {
    const parsedActions = this.parsePaymentActions(response.actions);

    return {
      externalId: response.reference_id,
      status: response.status,
      ...parsedActions,
    };
  }
}
