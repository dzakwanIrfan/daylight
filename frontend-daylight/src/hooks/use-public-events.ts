import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/event.service';
import type { QueryEventsParams } from '@/types/event.types';

// Query Keys
export const publicEventsKeys = {
  all: ['public-events'] as const,
  list: (params?: QueryEventsParams) => [...publicEventsKeys.all, 'list', params] as const,
  detail: (slug: string) => [...publicEventsKeys.all, 'detail', slug] as const,
  nextWeek: () => [...publicEventsKeys.all, 'next-week'] as const,
  purchaseStatus: (slug: string) => [...publicEventsKeys.all, 'purchase-status', slug] as const,
};

// Get public events with filters
export function usePublicEvents(params?: QueryEventsParams) {
  return useQuery({
    queryKey: publicEventsKeys.list(params),
    queryFn: () => eventService.getEvents(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get single event by slug
export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: publicEventsKeys.detail(slug),
    queryFn: () => eventService.getEventById(slug),
    enabled: !!slug,
    staleTime: 60000, // 1 minute
    retry: 1, // Only retry once on error
  });
}

// Get events for next week
export function useNextWeekEvents() {
  return useQuery({
    queryKey: publicEventsKeys.nextWeek(),
    queryFn: () => eventService.getNextWeekEvents(),
    staleTime: 30000,
  });
}

// Get user's purchase status for an event
export function useEventPurchaseStatus(slug: string) {
  return useQuery({
    queryKey: publicEventsKeys.purchaseStatus(slug),
    queryFn: () => eventService.getPurchaseStatus(slug),
    enabled: !!slug,
    staleTime: 30000,
    retry: 1,
  });
}