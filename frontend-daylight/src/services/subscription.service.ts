import apiClient from "@/lib/axios";
import type {
  SubscriptionPlan,
  UserSubscription,
  QueryUserSubscriptionsParams,
  QueryUserSubscriptionsResponse,
  CreateSubscriptionPaymentDto,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  UpdateSubscriptionPlanPricesDto,
  CreateSubscriptionPlanPriceDto,
  SubscriptionPlanPrice,
  UpdateSubscriptionPlanPriceDto,
} from "@/types/subscription.types";
import {
  AdminSubscription,
  BulkSubscriptionActionPayload,
  QuerySubscriptionsParams,
  QuerySubscriptionsResponse,
  SubscriptionStats,
} from "@/types/admin-subscription.types";

class SubscriptionService {
  private readonly baseURL = "/subscriptions";

  // USER ENDPOINTS

  async getActivePlans(): Promise<{
    success: boolean;
    data: SubscriptionPlan[];
  }> {
    const response = await apiClient.get(`${this.baseURL}/plans`);
    return response.data;
  }

  async getPlanById(planId: string): Promise<{
    success: boolean;
    data: SubscriptionPlan;
  }> {
    const response = await apiClient.get(`${this.baseURL}/plans/${planId}`);
    return response. data;
  }

  async getMyActiveSubscription(): Promise<{
    success: boolean;
    data: UserSubscription | null;
    hasActiveSubscription: boolean;
  }> {
    const response = await apiClient.get(`${this.baseURL}/my-subscription`);
    return response.data;
  }

  async getMySubscriptions(
    params?: QueryUserSubscriptionsParams
  ): Promise<QueryUserSubscriptionsResponse> {
    const response = await apiClient. get(`${this.baseURL}/my-subscriptions`, {
      params,
    });
    return response.data;
  }

  async getMySubscriptionById(subscriptionId: string): Promise<{
    success: boolean;
    data: UserSubscription;
  }> {
    const response = await apiClient.get(
      `${this.baseURL}/my-subscriptions/${subscriptionId}`
    );
    return response.data;
  }

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

  async createSubscriptionPayment(dto: CreateSubscriptionPaymentDto): Promise<{
    success: boolean;
    message: string;
    data: {
      transaction: any;
      plan: SubscriptionPlan;
    };
  }> {
    const response = await apiClient.post("/payment/subscribe", dto);
    return response. data;
  }

  // ADMIN - SUBSCRIPTION PLANS CRUD

  async getAllPlans(isActive?: boolean): Promise<{
    success: boolean;
    data: SubscriptionPlan[];
  }> {
    const response = await apiClient.get(`${this.baseURL}/admin/plans`, {
      params: { isActive },
    });
    return response.data;
  }

  async getPlanByIdAdmin(planId: string): Promise<{
    success: boolean;
    data: SubscriptionPlan;
  }> {
    const response = await apiClient.get(
      `${this.baseURL}/admin/plans/${planId}`
    );
    return response. data;
  }

  async createPlan(dto: CreateSubscriptionPlanDto): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionPlan;
  }> {
    const response = await apiClient.post(`${this.baseURL}/admin/plans`, dto);
    return response.data;
  }

  async updatePlan(
    planId: string,
    dto: UpdateSubscriptionPlanDto
  ): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionPlan;
  }> {
    const response = await apiClient.put(
      `${this.baseURL}/admin/plans/${planId}`,
      dto
    );
    return response.data;
  }

  async updatePlanPrices(
    planId: string,
    dto: UpdateSubscriptionPlanPricesDto
  ): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionPlan;
  }> {
    const response = await apiClient.put(
      `${this.baseURL}/admin/plans/${planId}/prices`,
      dto
    );
    return response.data;
  }

  async deletePlan(planId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(
      `${this.baseURL}/admin/plans/${planId}`
    );
    return response. data;
  }

  // ADMIN - SUBSCRIPTION PLAN PRICES CRUD

  async getPlanPrices(planId: string): Promise<{
    success: boolean;
    data: SubscriptionPlanPrice[];
  }> {
    const response = await apiClient. get(
      `${this. baseURL}/admin/plans/${planId}/prices`
    );
    return response.data;
  }

  async addPriceToPlan(
    planId: string,
    dto: CreateSubscriptionPlanPriceDto
  ): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionPlanPrice;
  }> {
    const response = await apiClient.post(
      `${this.baseURL}/admin/plans/${planId}/prices`,
      dto
    );
    return response.data;
  }

  async updatePrice(
    priceId: string,
    dto: UpdateSubscriptionPlanPriceDto
  ): Promise<{
    success: boolean;
    message: string;
    data: SubscriptionPlanPrice;
  }> {
    const response = await apiClient.put(
      `${this.baseURL}/admin/prices/${priceId}`,
      dto
    );
    return response.data;
  }

  async deletePrice(priceId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(
      `${this.baseURL}/admin/prices/${priceId}`
    );
    return response.data;
  }

  // ADMIN - USER SUBSCRIPTIONS MANAGEMENT

  async getAdminSubscriptions(
    params: QuerySubscriptionsParams
  ): Promise<QuerySubscriptionsResponse> {
    const response = await apiClient.get(`${this.baseURL}/admin/subscriptions`, {
      params,
    });
    return response.data;
  }

  async getSubscriptionStats(): Promise<{
    success: boolean;
    data: SubscriptionStats;
  }> {
    const response = await apiClient.get(`${this.baseURL}/admin/stats`);
    return response.data;
  }

  async bulkSubscriptionAction(
    payload: BulkSubscriptionActionPayload
  ): Promise<{
    success: boolean;
    message: string;
    affectedCount: number;
  }> {
    const response = await apiClient.post(
      `${this.baseURL}/admin/subscriptions/bulk`,
      payload
    );
    return response.data;
  }

  async exportSubscriptions(
    params: QuerySubscriptionsParams
  ): Promise<AdminSubscription[]> {
    const response = await apiClient.get(
      `${this.baseURL}/admin/subscriptions/export`,
      { params }
    );
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();