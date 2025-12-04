export interface PaymentAction {
  type: string;
  descriptor: string;
  value: string;
}

export interface XenditPaymentResponse {
  payment_request_id: string;
  country: string;
  currency: string;
  business_id: string;
  reference_id: string;
  description: string;
  created: string;
  updated: string;
  status: string;
  capture_method: string;
  channel_code: string;
  customer_id: string;
  request_amount: number;
  channel_properties: any;
  type: string;
  actions?: PaymentAction[];
}

export interface CreatePaymentResponse {
  transaction: {
    id: string;
    externalId: string;
    amount: number;
    totalFee: number;
    finalAmount: number;
    status: string;
    paymentUrl?: string;
    paymentCode?: string;
    qrString?: string;
  };
  xenditResponse: XenditPaymentResponse;
}
