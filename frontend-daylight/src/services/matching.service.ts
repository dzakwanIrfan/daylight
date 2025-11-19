import apiClient from '@/lib/axios';
import type {
  MatchingResultResponse,
  MatchingPreviewResponse,
  MatchingGroup,
  MatchingAttempt,
} from '@/types/matching.types';

class MatchingService {
  /**
   * Trigger matching for an event (Admin only)
   */
  async triggerMatching(eventId: string): Promise<MatchingPreviewResponse> {
    const response = await apiClient.post(`/matching/events/${eventId}/match`);
    return response.data;
  }

  /**
   * Preview matching without saving (Admin only)
   */
  async previewMatching(eventId: string): Promise<MatchingPreviewResponse> {
    const response = await apiClient.post(`/matching/events/${eventId}/preview`);
    return response.data;
  }

  /**
   * Get matching results for an event (Admin only)
   */
  async getMatchingResults(eventId: string): Promise<MatchingResultResponse> {
    const response = await apiClient.get(`/matching/events/${eventId}/results`);
    return response.data;
  }

  /**
   * Get matching attempt history (Admin only)
   */
  async getMatchingHistory(eventId: string): Promise<{
    eventId: string;
    totalAttempts: number;
    history: MatchingAttempt[];
  }> {
    const response = await apiClient.get(`/matching/events/${eventId}/history`);
    return response.data;
  }

  /**
   * Get user's matching group for an event
   */
  async getMyMatchingGroup(eventId: string): Promise<MatchingGroup> {
    const response = await apiClient.get(`/matching/events/${eventId}/my-group`);
    return response.data;
  }
}

export const matchingService = new MatchingService();