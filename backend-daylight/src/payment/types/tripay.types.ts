export interface TripayPaymentChannel {
  group: string;
  code: string;
  name: string;
  type: 'direct' | 'redirect';
  fee_merchant: {
    flat: number;
    percent: number;
  };
  fee_customer: {
    flat: number;
    percent: number;
  };
  total_fee: {
    flat: number;
    percent: string;
  };
  minimum_fee: number;
  maximum_fee: number;
  minimum_amount: number;
  maximum_amount: number;
  icon_url: string;
  active: boolean;
}

export interface TripayFeeCalculation {
  code: string;
  name: string;
  fee: {
    flat: number;
    percent: string;
    min: number | null;
    max: number | null;
  };
  total_fee: {
    merchant: number;
    customer: number;
  };
}

export interface TripayOrderItem {
  sku?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product_url?: string;
  image_url?: string;
}

export interface TripayInstruction {
  title: string;
  steps: string[];
}

export interface TripayTransaction {
  reference: string;
  merchant_ref: string;
  payment_selection_type: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  callback_url: string | null;
  return_url: string | null;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  pay_code: string | null;
  pay_url: string | null;
  checkout_url: string;
  order_items: TripayOrderItem[];
  status: string;
  note: string | null;
  created_at: number;
  expired_at: number;
  paid_at: number | null;
  instructions?: TripayInstruction[];
  qr_string?: string | null;
  qr_url?: string | null;
}

export interface TripayCallbackData {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_method_code: string;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: number;
  status: string;
  paid_at: number;
  note: string;
}