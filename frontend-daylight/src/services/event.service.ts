import apiClient from '@/lib/axios';
import type {
  Event,
  QueryEventsResponse,
  CreateEventInput,
  UpdateEventInput,
  QueryEventsParams,
  EventDashboardStats,
  BulkActionEventPayload,
  BulkActionEventResponse,
  EventPurchaseStatus,
} from '@/types/event.types';

class EventService {
  private readonly baseURL = '/events';

  /**
   * Get public events (with 24h restriction)
   */
  async getAdminEvents(params?: QueryEventsParams): Promise<QueryEventsResponse> {
    const response = await apiClient.get(this.baseURL, { params });
    return response.data;
  }

  /**
   * Get public events (with 24h restriction)
   */
  async getEvents(params?: QueryEventsParams): Promise<QueryEventsResponse> {
    const response = await apiClient.get(`${this.baseURL}/public`, { params });
    return response.data;
  }

  /**
   * Get events for next week (with 24h restriction)
   */
  async getNextWeekEvents(): Promise<{ data: Event[]; dateRange: { from: string; to: string }; total: number }> {
    const response = await apiClient.get(`${this.baseURL}/public/next-week`);
    return response.data;
  }

  /**
   * Get event by slug (with 24h restriction for non-purchasers)
   */
  async getEventAdminById(slug: string): Promise<Event> {
    const response = await apiClient.get(`${this.baseURL}/${slug}`);
    return response.data;
  }

  /**
   * Get event by slug (with 24h restriction for non-purchasers)
   */
  async getEventById(slug: string): Promise<Event> {
    const response = await apiClient.get(`${this.baseURL}/public/${slug}`);
    return response.data;
  }

  /**
   * Check user's purchase status for event
   */
  async getPurchaseStatus(slug: string): Promise<EventPurchaseStatus> {
    const response = await apiClient.get(`${this.baseURL}/public/${slug}/purchase-status`);
    return response.data;
  }

  /**
   * Create event (Admin only)
   */
  async createEvent(data: CreateEventInput): Promise<{ message: string; event: Event }> {
    const response = await apiClient.post(this.baseURL, data);
    return response.data;
  }

  /**
   * Update event (Admin only)
   */
  async updateEvent(
    id: string,
    data: UpdateEventInput,
  ): Promise<{ message: string; event: Event }> {
    const response = await apiClient.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  /**
   * Delete event (Admin only)
   */
  async deleteEvent(id: string, hardDelete = false): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/${id}`, {
      params: { hard: hardDelete },
    });
    return response.data;
  }

  /**
   * Bulk actions (Admin only)
   */
  async bulkAction(payload: BulkActionEventPayload): Promise<BulkActionEventResponse> {
    const response = await apiClient.post(`${this.baseURL}/bulk`, payload);
    return response.data;
  }

  /**
   * Get dashboard stats (Admin only)
   */
  async getDashboardStats(): Promise<EventDashboardStats> {
    const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
    return response.data;
  }

  /**
   * Export events (Admin only)
   */
  async exportEvents(params?: QueryEventsParams): Promise<Event[]> {
    const response = await apiClient.get(`${this.baseURL}/export`, { params });
    return response.data;
  }
}

export const eventService = new EventService();