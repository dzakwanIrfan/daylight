'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card } from '@/components/ui/card';
import { Users, Calendar, Crown, TrendingUp } from 'lucide-react';
import { dashboardService, type DashboardStats, type RecentUser, type UpcomingEvent } from '@/services/dashboard.service';
import { toast } from 'sonner';
import { formatDate, formatDateTime, getInitials } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, eventsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentUsers(4),
        dashboardService.getUpcomingEvents(4),
      ]);

      setStats(statsData);
      setRecentUsers(usersData);
      setUpcomingEvents(eventsData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatEventTime = (date: string, time: string) => {
    const eventDate = new Date(date);
    const eventTime = new Date(time);
    
    const timeStr = eventTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return `Today at ${timeStr}`;
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      const dateStr = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr} at ${timeStr}`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(date);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      DAYBREAK: 'from-orange-500 to-yellow-500',
      DAYTRIP: 'from-blue-500 to-cyan-500',
      DAYCARE: 'from-green-500 to-emerald-500',
      DAYDREAM: 'from-purple-500 to-pink-500',
    };
    return colors[category] || 'from-brand to-brand/80';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header Skeleton */}
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Activity Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statsConfig = [
    {
      title: 'Total Users',
      value: stats?.totalUsers.toLocaleString() || '0',
      change: stats?.growth.users || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Events',
      value: stats?.activeEvents.toString() || '0',
      change: stats?.growth.events || 0,
      icon: Calendar,
      color: 'text-brand',
      bg: 'bg-brand/10',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions.toLocaleString() || '0',
      change: stats?.growth.subscriptions || 0,
      icon: Crown,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'User Growth',
      value: formatGrowth(stats?.growth.users || 0),
      change: stats?.growth.users || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </h3>
                    <p className={`text-sm font-medium mt-1 ${getGrowthColor(stat.change)}`}>
                      {formatGrowth(stat.change)} from last month
                    </p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Users
            </h2>
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent users found
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.firstName || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand/20 to-brand/5 flex items-center justify-center">
                        <span className="text-sm font-bold text-brand">
                          {getInitials(user.firstName, user.lastName)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.firstName || user.lastName || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">
                      {getTimeAgo(user.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming events found
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${getCategoryColor(event.category)} flex items-center justify-center shrink-0`}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatEventTime(event.eventDate, event.startTime)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}