export enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum TransactionType {
  EVENT = 'EVENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum PaymentMethodType {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARDS = 'CARDS',
  EWALLET = 'EWALLET',
  ONLINE_BANKING = 'ONLINE_BANKING',
  OVER_THE_COUNTER = 'OVER_THE_COUNTER',
  PAYLATER = 'PAYLATER',
  QR_CODE = 'QR_CODE',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  type: PaymentMethodType;
  currency: string;
  countryCode: string;
  minAmount: number;
  maxAmount: number;
  adminFeeRate: number;
  adminFeeFixed: number;
  country: {
    name: string;
    currency: string;
  };
}

export interface TransactionAction {
  id: string;
  transactionId: string;
  type: string; // PRESENT_TO_CUSTOMER, REDIRECT_CUSTOMER, API_POST_REQUEST
  descriptor: string; // PAYMENT_CODE, QR_STRING, VIRTUAL_ACCOUNT_NUMBER, WEB_URL
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  eventId: string | null;
  externalId: string;
  status: TransactionStatus;
  amount: number;
  totalFee: number;
  finalAmount: number;
  paymentUrl: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string;
  transactionType: TransactionType;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
    currentCity?: {
      id: string;
      name: string;
      country: {
        code: string;
        name: string;
        currency: string;
      };
    };
  };

  event?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    eventDate: string;
    venue: string;
    city: string;
    cityRelation?: {
      name: string;
      country: {
        code: string;
        name: string;
      };
    };
  } | null;

  paymentMethod?: PaymentMethod | null;

  actions?: TransactionAction[];

  userSubscription?: {
    id: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    plan: {
      id: string;
      name: string;
      type: string;
      durationInMonths: number;
    };
  } | null;

  matchingMember?: {
    id: string;
    group: {
      id: string;
      groupNumber: number;
      status: string;
      event: {
        title: string;
        eventDate: string;
      };
    };
  } | null;
}

export interface QueryTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'paidAt' | 'amount' | 'finalAmount';
  sortOrder?: 'asc' | 'desc';
  status?: TransactionStatus;
  paymentMethodId?: string;
  userId?: string;
  eventId?: string;
  transactionType?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  countryCode?: string;
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
  filters: QueryTransactionsParams;
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface TransactionDashboardStats {
  overview: {
    totalTransactions: number;
    paidTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    totalRevenue: number;
  };
  breakdown: {
    byStatus: Array<{
      status: TransactionStatus;
      count: number;
      totalAmount: number;
    }>;
    byPaymentMethod: Array<{
      method: string;
      count: number;
      totalAmount: number;
    }>;
    byCountry: Array<{
      countryCode: string;
      countryName: string;
      currency: string;
      count: number;
      totalAmount: number;
    }>;
    byType: Array<{
      type: TransactionType;
      count: number;
      totalAmount: number;
    }>;
  };
  recentTransactions: Transaction[];
}

export enum TransactionBulkActionType {
  MARK_PAID = 'mark_paid',
  MARK_FAILED = 'mark_failed',
  MARK_EXPIRED = 'mark_expired',
  REFUND = 'refund',
  DELETE = 'delete',
}

export interface BulkActionTransactionPayload {
  transactionIds: string[];
  action: TransactionBulkActionType;
}

export interface BulkActionTransactionResponse {
  message: string;
  affectedCount: number;
}