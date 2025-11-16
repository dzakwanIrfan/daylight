import apiClient from '@/lib/axios';
import type {
  PaymentMethod,
  PaymentMethodGroup,
  FeeCalculation,
  CreatePaymentDto,
  Transaction,
  QueryTransactionsParams,
  QueryTransactionsResponse,
} from '@/types/payment.types';

class PaymentService {
  private readonly baseURL = '/payment';

  /**
   * Get available payment channels
   */
  async getPaymentChannels(): Promise<{
    success: boolean;
    data: PaymentMethodGroup;
    flat: PaymentMethod[];
  }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/channels`);
      
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: response.data.data, // Already grouped
          flat: response.data.flat || [], // Already flat array
        };
      }

      // Fallback if structure is different
      return {
        success: false,
        data: {},
        flat: [],
      };
    } catch (error) {
      console.error('Failed to fetch payment channels:', error);
      return {
        success: false,
        data: {},
        flat: [],
      };
    }
  }

  /**
   * Calculate payment fee
   */
  async calculateFee(
    amount: number,
    code?: string
  ): Promise<{
    success: boolean;
    data: FeeCalculation | FeeCalculation[];
  }> {
    const params = new URLSearchParams({ amount: amount.toString() });
    if (code) params.append('code', code);

    const response = await apiClient.get(
      `${this.baseURL}/calculate-fee?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Create payment transaction
   */
  async createPayment(data: CreatePaymentDto): Promise<{
    success: boolean;
    message: string;
    data: Transaction;
  }> {
    const response = await apiClient.post(`${this.baseURL}/create`, data);
    return response.data;
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(
    params: QueryTransactionsParams = {}
  ): Promise<QueryTransactionsResponse> {
    const response = await apiClient.get(`${this.baseURL}/my-transactions`, {
      params,
    });
    return response.data;
  }

  /**
   * Get transaction detail
   */
  async getTransactionDetail(id: string): Promise<{
    success: boolean;
    data: Transaction & { latestStatus?: string; instructions?: any };
  }> {
    const response = await apiClient.get(`${this.baseURL}/transaction/${id}`);
    return response.data;
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(id: string): Promise<{
    success: boolean;
    status: string;
    message: string;
  }> {
    const response = await apiClient.get(`${this.baseURL}/check-status/${id}`);
    return response.data;
  }
}

export const paymentService = new PaymentService();