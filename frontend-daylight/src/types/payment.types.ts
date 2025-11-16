export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentChannelType {
  DIRECT = 'DIRECT',
  REDIRECT = 'REDIRECT',
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  group: string;
  type: PaymentChannelType;
  feeMerchantFlat: number;
  feeMerchantPercent: number;
  feeCustomerFlat: number;
  feeCustomerPercent: number;
  minimumFee: number | null;
  maximumFee: number | null;
  minimumAmount: number;
  maximumAmount: number;
  iconUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodGroup {
  [groupName: string]: PaymentMethod[];
}

export interface FeeCalculation {
  code: string;
  name: string;
  amount: number;
  fee: {
    merchant: {
      flat: number;
      percent: number;
      total: number;
    };
    customer: {
      flat: number;
      percent: number;
      total: number;
    };
    total: number;
  };
  finalAmount: number;
  amountReceived: number;
}

export interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  tripayReference: string;
  merchantRef: string;
  paymentMethodCode: string | null;
  paymentMethod: string;
  paymentName: string;
  paymentStatus: PaymentStatus;
  amount: number;
  feeMerchant: number;
  feeCustomer: number;
  totalFee: number;
  amountReceived: number;
  payCode: string | null;
  payUrl: string | null;
  checkoutUrl: string | null;
  qrString: string | null;
  qrUrl: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  expiredAt: string | null;
  paidAt: string | null;
  instructions: PaymentInstruction[] | null;
  orderItems: OrderItem[];
  callbackData: any;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
    eventDate: string;
    venue: string;
    city: string;
  };
}

export interface PaymentInstruction {
  title: string;
  steps: string[];
}

export interface OrderItem {
  sku?: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product_url?: string;
  image_url?: string;
}

export interface CreatePaymentDto {
  eventId: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  quantity: number;
}

export interface QueryTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  eventId?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QueryTransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaymentWebSocketEvent {
  type: string;
  transactionId?: string;
  status?: PaymentStatus;
  message?: string;
  timeRemaining?: number;
  paidAt?: string;
  updatedAt?: string;
  event?: any;
  amount?: number;
}