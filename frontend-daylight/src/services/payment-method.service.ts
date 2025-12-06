import apiClient from '@/lib/axios';
import {
  PaymentMethod,
  QueryPaymentMethodsParams,
  QueryPaymentMethodsResponse,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
  BulkActionPayload,
  BulkActionResponse,
  CalculateFeeResponse,
  PaymentMethodStatistics,
  CountryOption,
  PaymentMethodType,
} from '@/types/payment-method.types';

class PaymentMethodService {
  private readonly baseURL = '/payment-methods';

  // PUBLIC METHODS

  /**
   * Get all active payment methods (Public)
   */
  async getActivePaymentMethods(
    countryCode?: string,
    currency?: string
  ): Promise<{
    success: boolean;
    data: Record<string, any>;
    flat: PaymentMethod[];
  }> {
    const params = new URLSearchParams();
    if (countryCode) params.append('countryCode', countryCode);
    if (currency) params.append('currency', currency);

    const response = await apiClient.get(`${this.baseURL}?${params.toString()}`);
    return response.data;
  }

  /**
   * Get payment methods by country (Public)
   */
  async getPaymentMethodsByCountry(countryCode: string): Promise<{
    success: boolean;
    country: { code: string; name: string; currency: string };
    data: Record<string, PaymentMethod[]>;
    flat: PaymentMethod[];
  }> {
    const response = await apiClient.get(`${this.baseURL}/country/${countryCode}`);
    return response.data;
  }

  /**
   * Get payment method by code (Public)
   */
  async getPaymentMethodByCode(code: string): Promise<PaymentMethod> {
    const response = await apiClient.get(`${this.baseURL}/code/${code}`);
    return response.data.data;
  }

  /**
   * Calculate fee for payment method (Public)
   */
  async calculateFee(code: string, amount: number): Promise<CalculateFeeResponse> {
    const response = await apiClient.get(
      `${this.baseURL}/code/${code}/calculate-fee? amount=${amount}`
    );
    return response.data;
  }

  // ADMIN METHODS

  /**
   * Get all payment methods with filtering, sorting, and pagination (Admin)
   */
  async getPaymentMethods(
    params: QueryPaymentMethodsParams
  ): Promise<QueryPaymentMethodsResponse> {
    const response = await apiClient.get(`${this.baseURL}/admin/list`, { params });
    return response.data;
  }

  /**
   * Get statistics (Admin)
   */
  async getStatistics(): Promise<PaymentMethodStatistics> {
    const response = await apiClient.get(`${this.baseURL}/admin/statistics`);
    return response.data;
  }

  /**
   * Create payment method (Admin)
   */
  async createPaymentMethod(
    payload: CreatePaymentMethodPayload
  ): Promise<{ success: boolean; message: string; data: PaymentMethod }> {
    const response = await apiClient.post(`${this.baseURL}/admin`, payload);
    return response.data;
  }

  /**
   * Update payment method (Admin)
   */
  async updatePaymentMethod(
    code: string,
    payload: UpdatePaymentMethodPayload
  ): Promise<{ success: boolean; message: string; data: PaymentMethod }> {
    const response = await apiClient.put(`${this.baseURL}/admin/${code}`, payload);
    return response.data;
  }

  /**
   * Toggle payment method (Admin)
   */
  async togglePaymentMethod(
    code: string
  ): Promise<{ success: boolean; message: string; data: PaymentMethod }> {
    const response = await apiClient.put(`${this.baseURL}/admin/${code}/toggle`);
    return response.data;
  }

  /**
   * Delete payment method (Admin)
   */
  async deletePaymentMethod(
    code: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/admin/${code}`);
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
  async exportPaymentMethods(
    params: QueryPaymentMethodsParams
  ): Promise<PaymentMethod[]> {
    const response = await apiClient.get(`${this.baseURL}/admin/export`, { params });
    return response.data;
  }

  /**
   * Get available countries (Admin)
   */
  async getAvailableCountries(): Promise<{ success: boolean; data: CountryOption[] }> {
    const response = await apiClient.get(`${this.baseURL}/admin/countries`);
    return response.data;
  }

  /**
   * Get available currencies (Admin)
   */
  async getAvailableCurrencies(): Promise<{ success: boolean; data: string[] }> {
    const response = await apiClient.get(`${this.baseURL}/admin/currencies`);
    return response.data;
  }

  /**
   * Get payment method types (Admin)
   */
  async getPaymentMethodTypes(): Promise<{
    success: boolean;
    data: PaymentMethodType[];
  }> {
    const response = await apiClient.get(`${this.baseURL}/admin/types`);
    return response.data;
  }
}

export const paymentMethodService = new PaymentMethodService();