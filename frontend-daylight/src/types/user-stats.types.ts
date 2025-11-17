export interface UserStats {
  personalityType: string | null;
  eventsAttended: number;
  upcomingEvents: number;
  totalEvents: number;
  connections: number;
  hasActiveSubscription: boolean;
  subscription: {
    planName: string;
    planType: string;
    endDate: string;
  } | null;
}

export interface RecentActivity {
  id: string;
  paidAt: string;
  amount: number;
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    eventDate: string;
    venue: string;
    city: string;
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export interface RecentActivityResponse {
  success: boolean;
  data: RecentActivity[];
}