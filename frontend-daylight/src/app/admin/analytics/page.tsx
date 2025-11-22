'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Users,
  UserCheck,
  UserX,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { analyticsService, type AnalyticsOverview, type TimelineData, type RealtimeData } from '@/services/analytics.service';
import { toast } from 'sonner';
import { AnalyticsChart } from '@/components/admin/analytics/analytics-chart';
import { TopPagesTable } from '@/components/admin/analytics/top-pages-table';
import { TopReferrersTable } from '@/components/admin/analytics/top-referrers-table';
import { RealtimeWidget } from '@/components/admin/analytics/realtime-widget';
import { ExportDialog } from '@/components/admin/analytics/export-dialog';

type DateRange = '7d' | '14d' | '30d' | '90d';

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getDateRange = useCallback((range: DateRange): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '14d':
        start.setDate(start.getDate() - 14);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
    }
    
    return { start, end };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { start, end } = getDateRange(dateRange);
      const granularity = dateRange === '90d' ? 'week' : 'day';

      const [overviewData, timelineData, realtimeData] = await Promise.all([
        analyticsService.getOverview(start, end),
        analyticsService.getTimeline(start, end, granularity),
        analyticsService.getRealtime(),
      ]);

      setOverview(overviewData);
      setTimeline(timelineData);
      setRealtime(realtimeData);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, getDateRange]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Auto-refresh realtime data every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const realtimeData = await analyticsService.getRealtime();
        setRealtime(realtimeData);
      } catch (error) {
        console.error('Failed to refresh realtime data:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>
          
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'Total Page Views',
      value: overview?.totalPageViews.toLocaleString() || '0',
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Unique Visitors',
      value: overview?.uniqueVisitors.toLocaleString() || '0',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Logged In Users',
      value: overview?.loggedInVisitors.toLocaleString() || '0',
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Anonymous Visitors',
      value: overview?.anonymousVisitors.toLocaleString() || '0',
      icon: UserX,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const deviceStats = [
    {
      title: 'Desktop',
      value: overview?.deviceBreakdown.desktop || 0,
      icon: Monitor,
      color: 'text-slate-600',
    },
    {
      title: 'Mobile',
      value: overview?.deviceBreakdown.mobile || 0,
      icon: Smartphone,
      color: 'text-slate-600',
    },
    {
      title: 'Tablet',
      value: overview?.deviceBreakdown.tablet || 0,
      icon: Tablet,
      color: 'text-slate-600',
    },
  ];

  const totalDeviceViews = deviceStats.reduce((acc, d) => acc + d.value, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-900">
              Traffic Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor your website traffic and user behavior
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Export Dialog */}
            <ExportDialog 
              defaultStartDate={getDateRange(dateRange).start}
              defaultEndDate={getDateRange(dateRange).end}
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Realtime Widget */}
        {realtime && <RealtimeWidget data={realtime} />}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Device Breakdown */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Device Breakdown</h3>
            <div className="space-y-3">
              {deviceStats.map((device) => {
                const Icon = device.icon;
                const percentage = totalDeviceViews > 0 
                  ? Math.round((device.value / totalDeviceViews) * 100) 
                  : 0;
                
                return (
                  <div key={device.title} className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${device.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{device.title}</span>
                        <span className="text-gray-500">{device.value.toLocaleString()} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-brand rounded-full h-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Session Metrics */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Session Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Avg. Duration</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {formatDuration(overview?.avgSessionDuration || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(overview?.bounceRate || 0) > 50 ? (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm text-gray-700">Bounce Rate</span>
                </div>
                <span className={`text-lg font-semibold ${
                  (overview?.bounceRate || 0) > 50 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {overview?.bounceRate.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Sessions</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {overview?.uniqueSessions.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Summary */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Quick Summary</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Pages per Session</p>
                <p className="text-xl font-bold text-blue-700">
                  {overview?.uniqueSessions 
                    ? (overview.totalPageViews / overview.uniqueSessions).toFixed(2)
                    : '0'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Conversion Rate</p>
                <p className="text-xl font-bold text-green-700">
                  {overview?.uniqueVisitors 
                    ? ((overview.loggedInVisitors / overview.uniqueVisitors) * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Traffic Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Over Time</h3>
          <AnalyticsChart data={timeline} />
        </Card>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
            <TopPagesTable pages={overview?.topPages || []} />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
            <TopReferrersTable referrers={overview?.topReferrers || []} />
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}