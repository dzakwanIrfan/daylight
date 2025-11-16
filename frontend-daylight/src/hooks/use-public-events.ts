import { useQuery } from '@tanstack/react-query';
import { publicEventService } from '@/services/public-event.service';
import { useAuth } from './use-auth';

// Query Keys
export const publicEventKeys = {
  all: ['public-events'] as const,
  lists: () => [...publicEventKeys.all, 'list'] as const,
  list: (params?: any) => [...publicEventKeys.lists(), params] as const,
  nextWeek: () => [...publicEventKeys.all, 'next-week'] as const,
  detail: (slug: string) => [...publicEventKeys.all, 'detail', slug] as const,
  purchaseStatus: (slug: string) => [...publicEventKeys.all, 'purchase-status', slug] as const,
};

// Get Public Events
export function usePublicEvents(params?: any) {
  return useQuery({
    queryKey: publicEventKeys.list(params),
    queryFn: () => publicEventService.getPublicEvents(params),
    staleTime: 60000, // 1 minute
  });
}

// Get Next Week Events
export function useNextWeekEvents() {
  return useQuery({
    queryKey: publicEventKeys.nextWeek(),
    queryFn: () => publicEventService.getNextWeekEvents(),
    staleTime: 60000, // 1 minute
  });
}

// Get Event by Slug
export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: publicEventKeys.detail(slug),
    queryFn: () => publicEventService.getEventBySlug(slug),
    enabled: !!slug,
    staleTime: 30000, // 30 seconds
  });
}

// Check Event Purchase Status
export function useEventPurchaseStatus(slug: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: publicEventKeys.purchaseStatus(slug),
    queryFn: () => publicEventService.checkPurchaseStatus(slug),
    enabled: !!slug && !!user, // Only run if user is logged in
    staleTime: 10000, // 10 seconds - Keep fresh for real-time check
    retry: 1, // Retry once if failed
  });
}