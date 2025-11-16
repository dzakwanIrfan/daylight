import apiClient from '@/lib/axios';
import type {
  QueryParticipantsParams,
  QueryParticipantsResponse,
  ParticipantDetail,
  EventParticipant,
} from '@/types/participant.types';

class ParticipantService {
  /**
   * Get event participants
   */
  async getEventParticipants(
    eventId: string,
    params?: QueryParticipantsParams
  ): Promise<QueryParticipantsResponse> {
    const response = await apiClient.get(`/events/${eventId}/participants`, { params });
    return response.data;
  }

  /**
   * Get participant detail
   */
  async getParticipantDetail(
    eventId: string,
    transactionId: string
  ): Promise<ParticipantDetail> {
    const response = await apiClient.get(
      `/events/${eventId}/participants/${transactionId}`
    );
    return response.data;
  }

  /**
   * Export participants
   */
  async exportParticipants(
    eventId: string,
    params?: QueryParticipantsParams
  ): Promise<EventParticipant[]> {
    const response = await apiClient.get(`/events/${eventId}/participants/export`, {
      params,
    });
    return response.data;
  }
}

export const participantService = new ParticipantService();