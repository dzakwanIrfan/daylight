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

// NEW: Multi-currency price structure
export interface SubscriptionPlanPrice {
  id: string;
  subscriptionPlanId: string;
  currency: string;
  amount: number;
  countryCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// NEW: User location info returned from API
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
  price: number;
  currency: string;
  currentPrice: number; // Price based on user's location
  currentCurrency: string; // Currency based on user's location
  userLocation?: UserLocation; // User's detected location
  availablePrices?: SubscriptionPlanPrice[]; // All available prices
  prices?: SubscriptionPlanPrice[]; // Alias for availablePrices

  durationInMonths: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  transactionId: string | null;
  transaction: {
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

export interface CreateSubscriptionPaymentDto {
  planId: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}
