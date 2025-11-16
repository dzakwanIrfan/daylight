export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
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
  instructions: any;
  orderItems: any;
  callbackData: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
  };
  event?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venue: string;
    address: string;
    city: string;
    price: number;
    currency: string;
  };
}

export interface QueryTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'paidAt' | 'amount' | 'amountReceived';
  sortOrder?: 'asc' | 'desc';
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  userId?: string;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
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
      status: PaymentStatus;
      count: number;
      totalAmount: number;
    }>;
    byPaymentMethod: Array<{
      method: string;
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