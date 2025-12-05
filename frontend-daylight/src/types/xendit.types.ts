import { Partner } from "./partner.types";

export enum XenditPaymentMethodType {
  BANK_TRANSFER = "BANK_TRANSFER",
  CARDS = "CARDS",
  EWALLET = "EWALLET",
  ONLINE_BANKING = "ONLINE_BANKING",
  OVER_THE_COUNTER = "OVER_THE_COUNTER",
  PAYLATER = "PAYLATER",
  QR_CODE = "QR_CODE",
}

export enum XenditTransactionStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
  REFUNDED = "REFUNDED",
}

export enum ItemType {
  EVENT = "EVENT",
  SUBSCRIPTION = "SUBSCRIPTION",
}

// Payment Method dari database
export interface XenditPaymentMethod {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  type: XenditPaymentMethodType;
  isActive: boolean;
  adminFeeRate: number;
  adminFeeFixed: number;
  logoUrl: string | null;
  country?: {
    id: string;
    code: string;
    name: string;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Grouped payment methods by type
export interface XenditPaymentMethodGroup {
  [type: string]: XenditPaymentMethod[];
}

// Transaction Action (dari Xendit response)
export interface TransactionAction {
  id: string;
  transactionId: string;
  type: "PRESENT_TO_CUSTOMER" | "REDIRECT_CUSTOMER" | "API_POST_REQUEST";
  descriptor:
    | "CAPTURE_PAYMENT"
    | "PAYMENT_CODE"
    | "QR_STRING"
    | "VIRTUAL_ACCOUNT_NUMBER"
    | "WEB_URL"
    | "DEEPLINK_URL"
    | "VALIDATE_OTP"
    | "RESEND_OTP";
  value: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription Plan Info untuk Transaction
export interface TransactionSubscriptionPlan {
  id: string;
  name: string;
  type: string;
  durationInMonths: number;
  features: string[];
  description?: string;
}

// User Subscription dalam Transaction
export interface TransactionUserSubscription {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  plan?: TransactionSubscriptionPlan;
}

// Transaction dari database
export interface XenditTransaction {
  id: string;
  userId: string;
  eventId: string | null;
  paymentMethodId: string;
  externalId: string;
  status: XenditTransactionStatus;
  amount: number;
  totalFee: number;
  finalAmount: number;
  paymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod: XenditPaymentMethod;
  event?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    address: string;
    city: string;
    price: number;
    currency: string;
    partner: Partner | null;
  };
  actions: TransactionAction[];
  userSubscription?: TransactionUserSubscription;
}

// Create Payment DTO
export interface CreateXenditPaymentDto {
  type: ItemType;
  itemId: string;
  paymentMethodId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

// Fee Calculation Response
export interface XenditFeeCalculation {
  paymentMethod: {
    id: string;
    name: string;
    code: string;
    type: XenditPaymentMethodType;
  };
  calculation: {
    baseAmount: number;
    feeRate: number;
    feeFixed: number;
    calculatedFee: number;
    totalFee: number;
    finalAmount: number;
  };
}

// Create Payment Response
export interface CreateXenditPaymentResponse {
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
    actions?: Array<{
      type: string;
      descriptor: string;
      value: string;
    }>;
  };
  xenditResponse: any;
}

// WebSocket Events
export interface XenditWebSocketEvent {
  type:
    | "payment:update"
    | "payment:status-update"
    | "payment:success"
    | "payment:failed"
    | "payment:expired"
    | "payment:countdown";
  transactionId: string;
  status?: XenditTransactionStatus;
  message?: string;
  timeRemaining?: number;
  paidAt?: string;
  updatedAt?: string;
  event?: any;
  amount?: number;
}

// Query Params
export interface QueryXenditTransactionsParams {
  page?: number;
  limit?: number;
  status?: XenditTransactionStatus;
  eventId?: string;
  search?: string;
}

// Query Response
export interface QueryXenditTransactionsResponse {
  data: XenditTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Helper type untuk payment info dari actions
export interface ParsedPaymentInfo {
  paymentUrl?: string;
  paymentCode?: string;
  qrString?: string;
  virtualAccountNumber?: string;
  deepLink?: string;
}

// Payment method type labels
export const PAYMENT_METHOD_TYPE_LABELS: Record<
  XenditPaymentMethodType,
  string
> = {
  [XenditPaymentMethodType.EWALLET]: "E-Wallet",
  [XenditPaymentMethodType.QR_CODE]: "QR Code",
  [XenditPaymentMethodType.BANK_TRANSFER]: "Virtual Account",
  [XenditPaymentMethodType.OVER_THE_COUNTER]: "Retail Outlet",
  [XenditPaymentMethodType.CARDS]: "Credit/Debit Card",
  [XenditPaymentMethodType.ONLINE_BANKING]: "Online Banking",
  [XenditPaymentMethodType.PAYLATER]: "Pay Later",
};
