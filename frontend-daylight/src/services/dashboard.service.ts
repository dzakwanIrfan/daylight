import apiClient from '@/lib/axios';

export interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  activeSubscriptions: number;
  growth: {
    users: number; // percentage
    events: number;
    subscriptions: number;
  };
}

export interface RecentUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
  profilePicture: string | null;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  category: string;
  currentParticipants: number;
  maxParticipants: number;
}

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  // Get recent users (last 4)
  getRecentUsers: async (limit: number = 4): Promise<RecentUser[]> => {
    const response = await apiClient.get('/dashboard/recent-users', {
      params: { limit },
    });
    return response.data;
  },

  // Get upcoming events (next 4)
  getUpcomingEvents: async (limit: number = 4): Promise<UpcomingEvent[]> => {
    const response = await apiClient.get('/dashboard/upcoming-events', {
      params: { limit },
    });
    return response.data;
  },
};