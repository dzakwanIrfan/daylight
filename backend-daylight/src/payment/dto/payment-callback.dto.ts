export class PaymentCallbackDto {
  merchant_ref: string;
  reference: string;
  status: string;
  payment_method: string;
  payment_name: string;
  amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  paid_at?: number;
  order_items: any[];
}