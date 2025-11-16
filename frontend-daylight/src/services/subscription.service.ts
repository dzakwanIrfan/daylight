import apiClient from '@/lib/axios';
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
}

export const subscriptionService = new SubscriptionService();