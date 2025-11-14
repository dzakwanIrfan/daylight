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
} from '@/types/event.types';

class EventService {
  private readonly baseURL = '/events';

  /**
   * Get events with filters
   */
  async getEvents(params?: QueryEventsParams): Promise<QueryEventsResponse> {
    const response = await apiClient.get(this.baseURL, { params });
    return response.data;
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<Event> {
    const response = await apiClient.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Create event
   */
  async createEvent(data: CreateEventInput): Promise<{ message: string; event: Event }> {
    const response = await apiClient.post(this.baseURL, data);
    return response.data;
  }

  /**
   * Update event
   */
  async updateEvent(
    id: string,
    data: UpdateEventInput,
  ): Promise<{ message: string; event: Event }> {
    const response = await apiClient.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string, hardDelete = false): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseURL}/${id}`, {
      params: { hard: hardDelete },
    });
    return response.data;
  }

  /**
   * Bulk actions
   */
  async bulkAction(payload: BulkActionEventPayload): Promise<BulkActionEventResponse> {
    const response = await apiClient.post(`${this.baseURL}/bulk`, payload);
    return response.data;
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<EventDashboardStats> {
    const response = await apiClient.get(`${this.baseURL}/dashboard/stats`);
    return response.data;
  }

  /**
   * Export events
   */
  async exportEvents(params?: QueryEventsParams): Promise<Event[]> {
    const response = await apiClient.get(`${this.baseURL}/export`, { params });
    return response.data;
  }
}

export const eventService = new EventService();