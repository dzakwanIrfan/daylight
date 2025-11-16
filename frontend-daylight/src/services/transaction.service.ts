import apiClient from '@/lib/axios';
import type {
  Transaction,
  QueryTransactionsResponse,
  QueryTransactionsParams,
  TransactionDashboardStats,
  BulkActionTransactionPayload,
  BulkActionTransactionResponse,
} from '@/types/transaction.types';

class TransactionService {
  private readonly baseURL = '/transactions';

  /**
   * Get transactions with filters
   */
  async getTransactions(params?: QueryTransactionsParams): Promise<QueryTransactionsResponse> {
    const response = await apiClient.get(this.baseURL, { params });
    return response.data;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string, hardDelete = false): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/${id}`, {
      params: { hard: hardDelete },
    });
    return response.data;
  }

  /**
   * Bulk actions
   */
  async bulkAction(payload: BulkActionTransactionPayload): Promise<BulkActionTransactionResponse> {
    const response = await apiClient.post(`${this.baseURL}/bulk`, payload);
    return response.data;
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<TransactionDashboardStats> {
    const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
    return response.data;
  }

  /**
   * Export transactions
   */
  async exportTransactions(params?: QueryTransactionsParams): Promise<Transaction[]> {
    const response = await apiClient.get(`${this.baseURL}/export`, { params });
    return response.data;
  }
}

export const transactionService = new TransactionService();