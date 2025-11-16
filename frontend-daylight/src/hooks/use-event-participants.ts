import { useQuery } from '@tanstack/react-query';
import { participantService } from '@/services/participant.service';
import type { QueryParticipantsParams } from '@/types/participant.types';

// Query Keys
export const participantKeys = {
  all: (eventId: string) => ['events', eventId, 'participants'] as const,
  lists: (eventId: string) => [...participantKeys.all(eventId), 'list'] as const,
  list: (eventId: string, params: QueryParticipantsParams) =>
    [...participantKeys.lists(eventId), params] as const,
  details: (eventId: string) => [...participantKeys.all(eventId), 'detail'] as const,
  detail: (eventId: string, transactionId: string) =>
    [...participantKeys.details(eventId), transactionId] as const,
};

// Get Event Participants Query
export function useEventParticipants(
  eventId: string,
  params: QueryParticipantsParams = {}
) {
  return useQuery({
    queryKey: participantKeys.list(eventId, params),
    queryFn: () => participantService.getEventParticipants(eventId, params),
    enabled: !!eventId,
    staleTime: 30000, // 30 seconds
  });
}

// Get Participant Detail Query
export function useParticipantDetail(eventId: string, transactionId: string) {
  return useQuery({
    queryKey: participantKeys.detail(eventId, transactionId),
    queryFn: () => participantService.getParticipantDetail(eventId, transactionId),
    enabled: !!eventId && !!transactionId,
  });
}