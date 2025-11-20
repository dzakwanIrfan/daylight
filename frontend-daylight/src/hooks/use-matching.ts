import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingService } from '@/services/matching.service';
import { toast } from 'sonner';
import type {
  AssignUserToGroupPayload,
  MoveUserPayload,
  RemoveUserPayload,
  CreateGroupPayload,
  BulkAssignPayload,
} from '@/types/matching.types';

// Query Keys
export const matchingKeys = {
  all: (eventId: string) => ['matching', eventId] as const,
  results: (eventId: string) => [...matchingKeys.all(eventId), 'results'] as const,
  history: (eventId: string) => [...matchingKeys.all(eventId), 'history'] as const,
  myGroup: (eventId: string) => [...matchingKeys.all(eventId), 'my-group'] as const,
  unassigned: (eventId: string) => [...matchingKeys.all(eventId), 'unassigned'] as const,
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
 * Get unassigned participants
 */
export function useUnassignedParticipants(eventId: string) {
  return useQuery({
    queryKey: matchingKeys.unassigned(eventId),
    queryFn: () => matchingService.getUnassignedParticipants(eventId),
    enabled: !!eventId,
  });
}

/**
 * Matching mutations
 */
export function useMatchingMutations(eventId: string) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: matchingKeys.results(eventId) });
    queryClient.invalidateQueries({ queryKey: matchingKeys.history(eventId) });
    queryClient.invalidateQueries({ queryKey: matchingKeys.unassigned(eventId) });
  };

  const triggerMatching = useMutation({
    mutationFn: () => matchingService.triggerMatching(eventId),
    onSuccess: () => {
      invalidateAll();
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

  const assignUser = useMutation({
    mutationFn: (payload: AssignUserToGroupPayload) =>
      matchingService.assignUserToGroup(eventId, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('User assigned to group successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign user');
    },
  });

  const moveUser = useMutation({
    mutationFn: (payload: MoveUserPayload) =>
      matchingService.moveUserBetweenGroups(eventId, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('User moved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to move user');
    },
  });

  const removeUser = useMutation({
    mutationFn: (payload: RemoveUserPayload) =>
      matchingService.removeUserFromGroup(eventId, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('User removed from group');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    },
  });

  const createGroup = useMutation({
    mutationFn: (payload: CreateGroupPayload) =>
      matchingService.createManualGroup(eventId, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('Group created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group');
    },
  });

  const bulkAssign = useMutation({
    mutationFn: (payload: BulkAssignPayload) =>
      matchingService.bulkAssignUsers(eventId, payload),
    onSuccess: () => {
      invalidateAll();
      toast.success('Users assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to bulk assign');
    },
  });

  return {
    triggerMatching,
    previewMatching,
    assignUser,
    moveUser,
    removeUser,
    createGroup,
    bulkAssign,
  };
}