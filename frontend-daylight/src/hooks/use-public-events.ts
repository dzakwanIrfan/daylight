import { useQuery } from '@tanstack/react-query';
import { publicEventService } from '@/services/public-event.service';
import type { QueryEventsParams } from '@/types/event.types';

// Query Keys
export const publicEventKeys = {
  all: ['public-events'] as const,
  lists: () => [...publicEventKeys.all, 'list'] as const,
  list: (params: QueryEventsParams) =>
    [...publicEventKeys.lists(), params] as const,
  nextWeek: () => [...publicEventKeys.all, 'next-week'] as const,
  details: () => [...publicEventKeys.all, 'detail'] as const,
  detail: (slug: string) => [...publicEventKeys.details(), slug] as const,
};

// Get Public Events Query
export function usePublicEvents(params: QueryEventsParams = {}) {
  return useQuery({
    queryKey: publicEventKeys.list(params),
    queryFn: () => publicEventService.getEvents(params),
    staleTime: 30000, // 30 seconds
  });
}

// Get Next Week Events Query
export function useNextWeekEvents() {
  return useQuery({
    queryKey: publicEventKeys.nextWeek(),
    queryFn: () => publicEventService.getNextWeekEvents(),
    staleTime: 60000, // 1 minute
  });
}

// Get Public Event by Slug Query
export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: publicEventKeys.detail(slug),
    queryFn: () => publicEventService.getEventBySlug(slug),
    enabled: !!slug,
  });
}