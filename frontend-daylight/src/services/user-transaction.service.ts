import apiClient from '@/lib/axios';
import type {
  Transaction,
  QueryTransactionsParams,
  QueryTransactionsResponse,
} from '@/types/payment.types';

class UserTransactionService {
  private readonly baseURL = '/payment';

  /**
   * Get user's paid and upcoming events
   */
  async getMyUpcomingEvents(): Promise<Transaction[]> {
    const response = await apiClient.get(`${this.baseURL}/my-transactions`, {
      params: {
        status: 'PAID',
        sortOrder: 'asc',
        limit: 100,
      },
    });

    // Filter upcoming events
    const now = new Date();
    return response.data.data.filter((transaction: Transaction) => {
      if (!transaction.event?.eventDate) return false;
      return new Date(transaction.event.eventDate) >= now;
    });
  }

  /**
   * Get user's past events
   */
  async getMyPastEvents(): Promise<Transaction[]> {
    const response = await apiClient.get(`${this.baseURL}/my-transactions`, {
      params: {
        status: 'PAID',
        sortOrder: 'desc',
        limit: 100,
      },
    });

    // Filter past events
    const now = new Date();
    return response.data.data.filter((transaction: Transaction) => {
      if (!transaction.event?.eventDate) return false;
      return new Date(transaction.event.eventDate) < now;
    });
  }

  /**
   * Get all user transactions
   */
  async getAllTransactions(
    params: QueryTransactionsParams = {}
  ): Promise<QueryTransactionsResponse> {
    const response = await apiClient.get(`${this.baseURL}/my-transactions`, {
      params: {
        ...params,
        sortOrder: params.sortOrder || 'desc',
      },
    });
    return response.data;
  }
}

export const userTransactionService = new UserTransactionService();