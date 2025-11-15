import apiClient from '@/lib/axios';
import type {
  Event,
  QueryEventsResponse,
  QueryEventsParams,
} from '@/types/event.types';

export interface NextWeekEventsResponse {
  data: Event[];
  dateRange: {
    from: string;
    to: string;
  };
  total: number;
}

class PublicEventService {
  private readonly baseURL = '/events/public';

  /**
   * Get public events with filters
   */
  async getEvents(params?: QueryEventsParams): Promise<QueryEventsResponse> {
    const response = await apiClient.get(this.baseURL, { params });
    return response.data;
  }

  /**
   * Get events for next week
   */
  async getNextWeekEvents(): Promise<NextWeekEventsResponse> {
    const response = await apiClient.get(`${this.baseURL}/next-week`);
    return response.data;
  }

  /**
   * Get event by slug
   */
  async getEventBySlug(slug: string): Promise<Event> {
    const response = await apiClient.get(`${this.baseURL}/${slug}`);
    return response.data;
  }
}

export const publicEventService = new PublicEventService();