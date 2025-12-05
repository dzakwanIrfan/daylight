export interface PaymentAction {
  type: 'PRESENT_TO_CUSTOMER' | 'REDIRECT_CUSTOMER' | 'API_POST_REQUEST';
  descriptor:
    | 'CAPTURE_PAYMENT'
    | 'PAYMENT_CODE'
    | 'QR_STRING'
    | 'VIRTUAL_ACCOUNT_NUMBER'
    | 'WEB_URL'
    | 'DEEPLINK_URL'
    | 'VALIDATE_OTP'
    | 'RESEND_OTP';
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

export interface TransactionActionData {
  type: string;
  descriptor: string;
  value: string;
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
    virtualAccountNumber?: string;
    actions?: TransactionActionData[];
  };
  xenditResponse: XenditPaymentResponse;
}
