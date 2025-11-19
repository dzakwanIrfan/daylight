import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingService } from '@/services/matching.service';
import { toast } from 'sonner';

// Query Keys
export const matchingKeys = {
  all: (eventId: string) => ['matching', eventId] as const,
  results: (eventId: string) => [...matchingKeys.all(eventId), 'results'] as const,
  history: (eventId: string) => [...matchingKeys.all(eventId), 'history'] as const,
  myGroup: (eventId: string) => [...matchingKeys.all(eventId), 'my-group'] as const,
};

/**
 * Get matching results for an event
 */
export function useMatchingResults(eventId: string) {
  return useQuery({
    queryKey: matchingKeys.results(eventId),
    queryFn: () => matchingService.getMatchingResults(eventId),
    enabled: !!eventId,
    retry: 1,
  });
}

/**
 * Get matching history for an event
 */
export function useMatchingHistory(eventId: string) {
  return useQuery({
    queryKey: matchingKeys.history(eventId),
    queryFn: () => matchingService.getMatchingHistory(eventId),
    enabled: !!eventId,
  });
}

/**
 * Get user's matching group
 */
export function useMyMatchingGroup(eventId: string) {
  return useQuery({
    queryKey: matchingKeys.myGroup(eventId),
    queryFn: () => matchingService.getMyMatchingGroup(eventId),
    enabled: !!eventId,
  });
}

/**
 * Matching mutations
 */
export function useMatchingMutations(eventId: string) {
  const queryClient = useQueryClient();

  const triggerMatching = useMutation({
    mutationFn: () => matchingService.triggerMatching(eventId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchingKeys.results(eventId) });
      queryClient.invalidateQueries({ queryKey: matchingKeys.history(eventId) });
      toast.success('Matching completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to trigger matching');
    },
  });

  const previewMatching = useMutation({
    mutationFn: () => matchingService.previewMatching(eventId),
    onSuccess: () => {
      toast.success('Preview generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate preview');
    },
  });

  return {
    triggerMatching,
    previewMatching,
  };
}