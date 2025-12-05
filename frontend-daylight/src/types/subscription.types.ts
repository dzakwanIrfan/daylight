export enum SubscriptionPlanType {
  MONTHLY_1 = "MONTHLY_1",
  MONTHLY_3 = "MONTHLY_3",
  MONTHLY_6 = "MONTHLY_6",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

// Multi-country price structure (using Country from database)
export interface SubscriptionPlanPrice {
  id: string;
  subscriptionPlanId: string;
  currency: string; // From Country. currency
  amount: number;
  countryCode: string | null; // From Country.code
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User location info returned from API
export interface UserLocation {
  currency?: string;
  countryCode?: string;
  cityId?: string;
  cityName?: string;
  countryName?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  description: string | null;
  price: number; // Legacy
  currency: string; // Legacy
  currentPrice: number; // Price based on user's location
  currentCurrency: string; // Currency based on user's location
  userLocation?: UserLocation;
  availablePrices?: SubscriptionPlanPrice[];
  prices?: SubscriptionPlanPrice[];
  selectedPrice?: SubscriptionPlanPrice;
  durationInMonths: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  activeSubscriptionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  // Xendit Transaction Reference
  transactionId: string | null;
  transaction: {
    id: string;
    externalId: string;
    amount: number;
    status: string;
  } | null;
  // Legacy Tripay Transaction Reference
  legacyTransactionId: string | null;
  legacyTransaction: {
    id: string;
    merchantRef: string;
    amount: number;
    paymentStatus: string;
    paidAt: string | null;
  } | null;
  startDate: string | null;
  endDate: string | null;
  cancelledAt: string | null;
  autoRenew: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface QueryUserSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  sortOrder?: "asc" | "desc";
}

export interface QueryUserSubscriptionsResponse {
  success: boolean;
  data: UserSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================
// XENDIT SUBSCRIPTION PAYMENT DTO - NEW
// ============================================
export interface CreateXenditSubscriptionPaymentDto {
  planId: string;
  paymentMethodId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

// ============================================
// LEGACY - Tripay DTO (deprecated)
// ============================================
export interface CreateSubscriptionPaymentDto {
  planId: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

// ============================================
// ADMIN TYPES
// ============================================
export interface CreateSubscriptionPlanDto {
  name: string;
  type: SubscriptionPlanType;
  description?: string;
  prices: CreateSubscriptionPlanPriceDto[];
  durationInMonths: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateSubscriptionPlanPriceDto {
  countryId: string; // UUID from Country table
  amount: number;
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  durationInMonths?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSubscriptionPlanPricesDto {
  prices: CreateSubscriptionPlanPriceDto[];
}

export interface UpdateSubscriptionPlanPriceDto {
  amount?: number;
  isActive?: boolean;
}
