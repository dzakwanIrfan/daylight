import { SubscriptionStatus, SubscriptionPlanType } from './subscription.types';

export interface AdminSubscription {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  planId: string;
  plan: {
    id: string;
    name: string;
    type: SubscriptionPlanType;
    price: number;
    durationInMonths: number;
  };
  status: SubscriptionStatus;
  transactionId: string | null;
  transaction: {
    id: string;
    merchantRef: string;
    amount: number;
    status: string;
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

export interface SubscriptionStats {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
  };
  byPlan: {
    planId: string;
    _count: number;
  }[];
}

export interface QuerySubscriptionsParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  userId?: string;
  planId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QuerySubscriptionsResponse {
  success: boolean;
  data: AdminSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  description: string | null;
  price: number;
  currency: string;
  durationInMonths: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export enum BulkSubscriptionActionType {
  CANCEL = 'cancel',
  ACTIVATE = 'activate',
}

export interface BulkSubscriptionActionPayload {
  subscriptionIds: string[];
  action: BulkSubscriptionActionType;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  type: SubscriptionPlanType;
  description?: string;
  price: number;
  currency?: string;
  durationInMonths: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  description?: string;
  price?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}