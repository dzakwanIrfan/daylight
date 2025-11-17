import { useQuery } from '@tanstack/react-query';
import { userStatsService } from '@/services/user-stats.service';

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userStatsService.getUserStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecentActivity(limit?: number) {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: () => userStatsService.getRecentActivity(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}