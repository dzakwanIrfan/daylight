import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import { toast } from 'sonner';
import type {
  QueryEventsParams,
  CreateEventInput,
  UpdateEventInput,
  BulkActionEventPayload,
} from '@/types/event.types';

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params: QueryEventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  stats: () => [...eventKeys.all, 'stats'] as const,
};

// Get Events Query
export function useAdminEvents(params: QueryEventsParams = {}) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.getAdminEvents(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get Event by ID Query
export function useAdminEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventAdminById(id),
    enabled: !!id,
  });
}

// Get Dashboard Stats Query
export function useEventDashboardStats() {
  return useQuery({
    queryKey: eventKeys.stats(),
    queryFn: () => eventService.getDashboardStats(),
    staleTime: 60000, // 1 minute
  });
}

// Mutations Hook
export function useAdminEventMutations() {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: (data: CreateEventInput) => eventService.createEvent(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.stats() });
      toast.success(data.message || 'Event created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventInput }) =>
      eventService.updateEvent(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.stats() });
      toast.success(data.message || 'Event updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update event');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      eventService.deleteEvent(id, hardDelete),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.stats() });
      toast.success(data.message || 'Event deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });

  const bulkAction = useMutation({
    mutationFn: (payload: BulkActionEventPayload) => eventService.bulkAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.stats() });
      toast.success(data.message || 'Bulk action completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    },
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    bulkAction,
  };
}