import apiClient from '@/lib/axios';
import {
  PaymentMethod,
  QueryPaymentMethodsParams,
  QueryPaymentMethodsResponse,
  UpdatePaymentMethodPayload,
  BulkActionPayload,
  BulkActionResponse,
} from '@/types/payment-method.types';

class PaymentMethodService {
  private readonly baseURL = '/payment-methods';

  /**
   * Get all payment methods with filtering, sorting, and pagination (Admin)
   */
  async getPaymentMethods(params: QueryPaymentMethodsParams): Promise<QueryPaymentMethodsResponse> {
    const response = await apiClient.get(`${this.baseURL}/admin/list`, { params });
    return response.data;
  }

  /**
   * Get payment method by code (Admin)
   */
  async getPaymentMethodByCode(code: string): Promise<PaymentMethod> {
    const response = await apiClient.get(`${this.baseURL}/${code}`);
    return response.data.data;
  }

  /**
   * Update payment method (Admin)
   */
  async updatePaymentMethod(
    code: string,
    payload: UpdatePaymentMethodPayload
  ): Promise<{ message: string; data: PaymentMethod }> {
    const response = await apiClient.put(`${this.baseURL}/admin/${code}`, payload);
    return response.data;
  }

  /**
   * Toggle payment method (Admin)
   */
  async togglePaymentMethod(code: string): Promise<{ message: string; data: PaymentMethod }> {
    const response = await apiClient.put(`${this.baseURL}/admin/${code}/toggle`);
    return response.data;
  }

  /**
   * Bulk actions on payment methods (Admin)
   */
  async bulkAction(payload: BulkActionPayload): Promise<BulkActionResponse> {
    const response = await apiClient.post(`${this.baseURL}/admin/bulk`, payload);
    return response.data;
  }

  /**
   * Export payment methods data (Admin)
   */
  async exportPaymentMethods(params: QueryPaymentMethodsParams): Promise<PaymentMethod[]> {
    const response = await apiClient.get(`${this.baseURL}/admin/export`, { params });
    return response.data;
  }

  /**
   * Get unique groups (Admin)
   */
  async getUniqueGroups(): Promise<string[]> {
    const response = await apiClient.get(`${this.baseURL}/admin/groups`);
    return response.data.data;
  }

  /**
   * Sync with Tripay (Admin)
   */
  async syncWithTripay(data: any[]): Promise<{ message: string; stats: any }> {
    const response = await apiClient.post(`${this.baseURL}/admin/sync`, { data });
    return response.data;
  }
}

export const paymentMethodService = new PaymentMethodService();