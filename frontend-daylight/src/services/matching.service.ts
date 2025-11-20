import apiClient from '@/lib/axios';
import type {
  MatchingResultResponse,
  MatchingPreviewResponse,
  MatchingGroup,
  MatchingAttempt,
  UnassignedParticipantsResponse,
  AssignUserToGroupPayload,
  MoveUserPayload,
  RemoveUserPayload,
  CreateGroupPayload,
  BulkAssignPayload,
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

  // ==================== MANUAL ASSIGNMENT ====================

  /**
   * Get unassigned participants
   */
  async getUnassignedParticipants(eventId: string): Promise<UnassignedParticipantsResponse> {
    const response = await apiClient.get(`/matching/events/${eventId}/unassigned`);
    return response.data;
  }

  /**
   * Assign user to group
   */
  async assignUserToGroup(eventId: string, payload: AssignUserToGroupPayload) {
    const response = await apiClient.post(`/matching/events/${eventId}/assign`, payload);
    return response.data;
  }

  /**
   * Move user between groups
   */
  async moveUserBetweenGroups(eventId: string, payload: MoveUserPayload) {
    const response = await apiClient.post(`/matching/events/${eventId}/move`, payload);
    return response.data;
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(eventId: string, payload: RemoveUserPayload) {
    const response = await apiClient.post(`/matching/events/${eventId}/remove`, payload);
    return response.data;
  }

  /**
   * Create manual group
   */
  async createManualGroup(eventId: string, payload: CreateGroupPayload) {
    const response = await apiClient.post(`/matching/events/${eventId}/create-group`, payload);
    return response.data;
  }

  /**
   * Bulk assign users
   */
  async bulkAssignUsers(eventId: string, payload: BulkAssignPayload) {
    const response = await apiClient.post(`/matching/events/${eventId}/bulk-assign`, payload);
    return response.data;
  }
}

export const matchingService = new MatchingService();