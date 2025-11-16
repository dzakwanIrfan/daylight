import apiClient from '@/lib/axios';
import type { Event } from '@/types/event.types';
import type { EventPurchaseStatus } from '@/types/event.types';

class PublicEventService {
  private readonly baseURL = '/events/public';

  /**
   * Get all public events
   */
  async getPublicEvents(params?: any): Promise<any> {
    const response = await apiClient.get(this.baseURL, { params });
    return response.data;
  }

  /**
   * Get next week events
   */
  async getNextWeekEvents(): Promise<any> {
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

  /**
   * Check if user has already purchased this event
   */
  async checkPurchaseStatus(slug: string): Promise<EventPurchaseStatus> {
    const response = await apiClient.get(`${this.baseURL}/${slug}/purchase-status`);
    return response.data;
  }
}

export const publicEventService = new PublicEventService();