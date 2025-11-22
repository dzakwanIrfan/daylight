export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  loggedInVisitors: number;
  anonymousVisitors: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
    unknown: number;
  };
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface TimelineData {
  date: string;
  total: number;
  loggedIn: number;
  anonymous: number;
}

export interface RealtimeData {
  activeSessions: number;
  loggedInUsers: number;
  anonymousUsers: number;
  currentPages: Array<{ path: string; users: number }>;
}

export interface DailyAnalytics {
  id: string;
  date: string;
  totalPageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  loggedInVisitors: number;
  anonymousVisitors: number;
  desktopViews: number;
  mobileViews: number;
  tabletViews: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  avgSessionDuration: number;
  bounceRate: number;
}

export type DateRange = '7d' | '14d' | '30d' | '90d' | 'custom';

export type ExportFormat = 'csv' | 'xlsx';

export type ExportType = 
  | 'overview'
  | 'page_views'
  | 'daily_summary'
  | 'top_pages'
  | 'top_referrers'
  | 'device_breakdown'
  | 'full_report';

export interface ExportOptions {
  startDate: Date;
  endDate: Date;
  format: ExportFormat;
  type: ExportType;
}