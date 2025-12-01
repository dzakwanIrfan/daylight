import apiClient from '@/lib/axios';
import type { MyEventsResponse, MyPastEventsResponse } from '@/types/my-events.types';
import type { QueryTransactionsResponse, QueryTransactionsParams } from '@/types/payment.types';
import type { MatchingGroup } from '@/types/matching.types';

class MyEventsService {
  private readonly baseURL = '/user-events';

  /**
   * Get user's upcoming events (paid and not passed)
   */
  async getMyEvents(): Promise<MyEventsResponse> {
    const response = await apiClient.get(`${this.baseURL}/my-events`);
    return response.data;
  }

  /**
   * Get user's past events
   */
  async getPastEvents(): Promise<MyPastEventsResponse> {
    const response = await apiClient.get(`${this.baseURL}/past-events`);
    return response.data;
  }

  /**
   * Get user's transactions (reuse from payment service)
   */
  async getMyTransactions(params?: QueryTransactionsParams): Promise<QueryTransactionsResponse> {
    const response = await apiClient.get('/payment/my-transactions', { params });
    return response.data;
  }

  /**
   * Get user's matching group for specific event
   */
  async getMyMatchingGroup(eventId: string): Promise<MatchingGroup> {
    const response = await apiClient.get(`/matching/events/${eventId}/my-group`);
    return response.data.group;
  }
}

export const myEventsService = new MyEventsService();