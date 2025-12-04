export enum XenditWebhookEvent {
  PAYMENT_CAPTURE = 'payment.capture',
  PAYMENT_AUTHORIZATION = 'payment.authorization',
  PAYMENT_FAILURE = 'payment.failure',
  PAYMENT_EXPIRED = 'payment.expired',
}

export enum XenditPaymentStatus {
  SUCCEEDED = 'SUCCEEDED',
  AUTHORIZED = 'AUTHORIZED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export interface XenditWebhookData {
  payment_id: string;
  business_id: string;
  status: XenditPaymentStatus;
  payment_request_id: string;
  request_amount: number;
  customer_id: string;
  channel_code: string;
  country: string;
  currency: string;
  reference_id: string;
  description: string;
  failure_code?: string;
  channel_properties: {
    failure_return_url?: string;
    success_return_url?: string;
  };
  type: string;
  created: string;
  updated: string;
}

export interface XenditWebhookPayload {
  event: XenditWebhookEvent;
  business_id: string;
  created: string;
  data: XenditWebhookData;
}
