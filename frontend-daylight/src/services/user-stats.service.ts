import apiClient from '@/lib/axios';
import { UserStatsResponse, RecentActivityResponse } from '@/types/user-stats.types';

export const userStatsService = {
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await apiClient.get('/user-stats');
    return response.data;
  },

  getRecentActivity: async (limit?: number): Promise<RecentActivityResponse> => {
    const params = limit ? { limit: limit.toString() } : {};
    const response = await apiClient.get('/user-stats/recent-activity', { params });
    return response.data;
  },
};