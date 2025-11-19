export interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  activeSubscriptions: number;
  growth: {
    users: number;
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
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: 'USER' | 'ADMIN';
  provider: 'LOCAL' | 'GOOGLE';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}