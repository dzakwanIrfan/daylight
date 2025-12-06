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

export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
}

export interface Country {
  code: string;
  name: string;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  country: Country | null;
  currency: string;
  minAmount: number;
  maxAmount: number;
  type: PaymentMethodType;
  adminFeeRate: number;
  adminFeeRatePercent: number; // For display (e.g., 2.5%)
  adminFeeFixed: number;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueryPaymentMethodsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'code' | 'countryCode' | 'currency' | 'type';
  sortOrder?: 'asc' | 'desc';
  countryCode?: string;
  currency?: string;
  type?: PaymentMethodType;
  isActive?: boolean;
}

export interface QueryPaymentMethodsResponse {
  data: PaymentMethod[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search?: string;
    countryCode?: string;
    currency?: string;
    type?: PaymentMethodType;
    isActive?: boolean;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface CreatePaymentMethodPayload {
  code: string;
  name: string;
  countryCode: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  type: PaymentMethodType;
  adminFeeRate?: number;
  adminFeeFixed?: number;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdatePaymentMethodPayload {
  name?: string;
  countryCode?: string;
  currency?: string;
  type?: PaymentMethodType;
  adminFeeRate?: number;
  adminFeeFixed?: number;
  minAmount?: number;
  maxAmount?: number;
  logoUrl?: string;
  isActive?: boolean;
}

export interface BulkActionPayload {
  codes: string[];
  action: BulkActionType;
}

export interface BulkActionResponse {
  success: boolean;
  message: string;
  affectedCount: number;
}

export interface CalculateFeeResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    currency: string;
    countryCode: string;
    amount: number;
    fee: {
      rate: number;
      ratePercent: number;
      fixed: number;
      percentageAmount: number;
      total: number;
    };
    finalAmount: number;
    amountReceived: number;
    formatted: {
      amount: string;
      fee: string;
      finalAmount: string;
    };
  };
}

export interface PaymentMethodStatistics {
  success: boolean;
  data: {
    overview: {
      total: number;
      active: number;
      inactive: number;
      countries: number;
    };
    byCountry: Array<{
      countryCode: string;
      countryName: string;
      count: number;
    }>;
    byType: Array<{
      type: PaymentMethodType;
      count: number;
    }>;
    topPerforming: Array<{
      code: string;
      name: string;
      transactionCount: number;
      totalAmount: number;
    }>;
  };
}

export interface CountryOption {
  code: string;
  name: string;
  currency: string;
  paymentMethodCount: number;
}

// Type labels for display
export const PaymentMethodTypeLabels: Record<PaymentMethodType, string> = {
  [PaymentMethodType.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethodType.CARDS]: 'Credit/Debit Cards',
  [PaymentMethodType.EWALLET]: 'E-Wallet',
  [PaymentMethodType.ONLINE_BANKING]: 'Online Banking',
  [PaymentMethodType.OVER_THE_COUNTER]: 'Over the Counter',
  [PaymentMethodType.PAYLATER]: 'Pay Later',
  [PaymentMethodType.QR_CODE]: 'QR Code',
  [PaymentMethodType.SUBSCRIPTION]: 'Subscription',
};