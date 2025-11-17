import apiClient from '@/lib/axios';
import { AdminSubscription, AdminSubscriptionPlan, BulkSubscriptionActionPayload, CreateSubscriptionPlanDto, QuerySubscriptionsParams, QuerySubscriptionsResponse, SubscriptionStats, UpdateSubscriptionPlanDto } from '@/types/admin-subscription.types';
import type {
  SubscriptionPlan,
  UserSubscription,
  QueryUserSubscriptionsParams,
  QueryUserSubscriptionsResponse,
  CreateSubscriptionPaymentDto,
} from '@/types/subscription.types';

class SubscriptionService {
  private readonly baseURL = '/subscriptions';

  /**
   * Get all active subscription plans (Public)
   */
  async getActivePlans(): Promise<{
    success: boolean;
    data: SubscriptionPlan[];
  }> {
    const response = await apiClient.get(`${this.baseURL}/plans`);
    return response.data;
  }

  /**
   * Get plan by ID (Public)
   */
  async getPlanById(planId: string): Promise<{
    success: boolean;
    data: SubscriptionPlan;
  }> {
    const response = await apiClient.get(`${this.baseURL}/plans/${planId}`);
    return response.data;
  }

  /**
   * Get user's active subscription
   */
  async getMyActiveSubscription(): Promise<{
    success: boolean;
    data: UserSubscription | null;
    hasActiveSubscription: boolean;
  }> {
    const response = await apiClient.get(`${this.baseURL}/my-subscription`);
    return response.data;
  }

  /**
   * Get user's subscription history
   */
  async getMySubscriptions(
    params?: QueryUserSubscriptionsParams
  ): Promise<QueryUserSubscriptionsResponse> {
    const response = await apiClient.get(`${this.baseURL}/my-subscriptions`, {
      params,
    });
    return response.data;
  }

  /**
   * Get subscription detail
   */
  async getMySubscriptionById(subscriptionId: string): Promise<{
    success: boolean;
    data: UserSubscription;
  }> {
    const response = await apiClient.get(
      `${this.baseURL}/my-subscriptions/${subscriptionId}`
    );
    return response.data;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: UserSubscription;
  }> {
    const response = await apiClient.post(
      `${this.baseURL}/my-subscriptions/${subscriptionId}/cancel`,
      { reason }
    );
    return response.data;
  }

  /**
   * Create subscription payment
   */
  async createSubscriptionPayment(
    dto: CreateSubscriptionPaymentDto
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      transaction: any;
      plan: SubscriptionPlan;
    };
  }> {
    const response = await apiClient.post('/payment/subscribe', dto);
    return response.data;
  }

  /**
   * Get all subscriptions with filtering (Admin)
   */
  async getAdminSubscriptions(
    params: QuerySubscriptionsParams
  ): Promise<QuerySubscriptionsResponse> {
    const response = await apiClient.get('/subscriptions/admin/subscriptions', {
      params,
    });
    return response.data;
  }

  /**
   * Get subscription statistics (Admin)
   */
  async getSubscriptionStats(): Promise<{
    success: boolean;
    data: SubscriptionStats;
  }> {
    const response = await apiClient.get('/subscriptions/admin/stats');
    return response.data;
  }

  /**
   * Bulk actions on subscriptions (Admin)
   */
  async bulkSubscriptionAction(
    payload: BulkSubscriptionActionPayload
  ): Promise<{
    success: boolean;
    message: string;
    affectedCount: number;
  }> {
    const response = await apiClient.post(
      '/subscriptions/admin/subscriptions/bulk',
      payload
    );
    return response.data;
  }

  /**
   * Export subscriptions (Admin)
   */
  async exportSubscriptions(
    params: QuerySubscriptionsParams
  ): Promise<AdminSubscription[]> {
    const response = await apiClient.get(
      '/subscriptions/admin/subscriptions/export',
      { params }
    );
    return response.data;
  }

  /**
   * Get all plans including inactive (Admin)
   */
  async getAllPlans(isActive?: boolean): Promise<{
    success: boolean;
    data: any[];
  }> {
    const response = await apiClient.get('/subscriptions/admin/plans', {
      params: { isActive },
    });
    return response.data;
  }

  /**
   * Create subscription plan (Admin)
   */
  async createPlan(
    dto: CreateSubscriptionPlanDto
  ): Promise<{
    success: boolean;
    message: string;
    data: AdminSubscriptionPlan;
  }> {
    const response = await apiClient.post('/subscriptions/admin/plans', dto);
    return response.data;
  }

  /**
   * Update subscription plan (Admin)
   */
  async updatePlan(
    planId: string,
    dto: UpdateSubscriptionPlanDto
  ): Promise<{
    success: boolean;
    message: string;
    data: AdminSubscriptionPlan;
  }> {
    const response = await apiClient.put(
      `/subscriptions/admin/plans/${planId}`,
      dto
    );
    return response.data;
  }

  /**
   * Delete subscription plan (Admin)
   */
  async deletePlan(planId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(
      `/subscriptions/admin/plans/${planId}`
    );
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();