import apiClient from "@/lib/axios";
import type {
  MyEventsResponse,
  MyPastEventsResponse,
} from "@/types/my-events.types";
import type { MatchingGroup } from "@/types/matching.types";
import type {
  QueryXenditTransactionsParams,
  QueryXenditTransactionsResponse,
} from "@/types/xendit.types";

class MyEventsService {
  private readonly baseURL = "/user-events";
  private readonly xenditURL = "/xendit";

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
   * Get user's transactions (Xendit transactions)
   */
  async getMyTransactions(
    params?: QueryXenditTransactionsParams
  ): Promise<QueryXenditTransactionsResponse> {
    const response = await apiClient.get(`${this.xenditURL}/my-transactions`, {
      params,
    });
    return response.data;
  }

  /**
   * Get user's matching group for specific event
   */
  async getMyMatchingGroup(eventId: string): Promise<MatchingGroup> {
    const response = await apiClient.get(
      `/matching/events/${eventId}/my-group`
    );
    return response.data.group;
  }

  /**
   * Register for free event (with subscription)
   */
  async registerFreeEvent(data: {
    eventId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const response = await apiClient.post(
      `${this.baseURL}/register-free`,
      data
    );
    return response.data;
  }
}

export const myEventsService = new MyEventsService();
