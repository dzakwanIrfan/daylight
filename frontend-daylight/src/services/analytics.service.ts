import apiClient from '@/lib/axios';

// Generate unique session ID
const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
};

// Get or create session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Simple fingerprint generation (without external library)
const generateFingerprint = async (): Promise<string> => {
  if (typeof window === 'undefined') return '';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ];

  const fingerprint = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Extract UTM parameters from URL
const getUtmParams = () => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    utmContent: params.get('utm_content') || undefined,
  };
};

// Get query params as object
const getQueryParams = (): Record<string, string> | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return Object.keys(result).length > 0 ? result : undefined;
};

export interface TrackPageViewResponse {
  success: boolean;
  id?: string;
}

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

export type ExportFormat = 'csv' | 'xlsx';
export type ExportType = 
  | 'overview'
  | 'page_views'
  | 'daily_summary'
  | 'top_pages'
  | 'top_referrers'
  | 'device_breakdown'
  | 'full_report';

export const analyticsService = {
  /**
   * Track a page view
   */
  trackPageView: async (path: string): Promise<TrackPageViewResponse> => {
    try {
      const sessionId = getSessionId();
      const fingerprint = await generateFingerprint();
      const utmParams = getUtmParams();
      const queryParams = getQueryParams();

      const response = await apiClient.post<TrackPageViewResponse>('/analytics/track', {
        sessionId,
        fingerprint,
        path,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        queryParams,
        ...utmParams,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to track page view:', error);
      return { success: false };
    }
  },

  /**
   * Update page view duration when leaving
   */
  updateDuration: async (pageViewId: string, duration: number): Promise<void> => {
    try {
      await apiClient.patch(`/analytics/track/${pageViewId}/duration`, {
        duration: Math.round(duration),
      });
    } catch (error) {
      console.error('Failed to update duration:', error);
    }
  },

  /**
   * Get analytics overview (admin only)
   */
  getOverview: async (startDate?: Date, endDate?: Date): Promise<AnalyticsOverview> => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate.toISOString());
    if (endDate) params.set('endDate', endDate.toISOString());

    const response = await apiClient.get<AnalyticsOverview>(`/analytics/overview?${params}`);
    return response.data;
  },

  /**
   * Get timeline data (admin only)
   */
  getTimeline: async (
    startDate?: Date,
    endDate?: Date,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Promise<TimelineData[]> => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate.toISOString());
    if (endDate) params.set('endDate', endDate.toISOString());
    params.set('granularity', granularity);

    const response = await apiClient.get<TimelineData[]>(`/analytics/timeline?${params}`);
    return response.data;
  },

  /**
   * Get real-time data (admin only)
   */
  getRealtime: async (): Promise<RealtimeData> => {
    const response = await apiClient.get<RealtimeData>('/analytics/realtime');
    return response.data;
  },

  /**
   * Get historical analytics (admin only)
   */
  getHistorical: async (startDate?: Date, endDate?: Date) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate.toISOString());
    if (endDate) params.set('endDate', endDate.toISOString());

    const response = await apiClient.get(`/analytics/historical?${params}`);
    return response.data;
  },

  /**
   * Export analytics data
   */
  exportData: async (
    startDate: Date,
    endDate: Date,
    format: ExportFormat = 'csv',
    type: ExportType = 'full_report'
  ): Promise<void> => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format,
      type,
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/analytics/export?${params}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `analytics_export.${format}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        filename = match[1];
      }
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get export URL for direct download
   */
  getExportUrl: (
    startDate: Date,
    endDate: Date,
    format: ExportFormat = 'csv',
    type: ExportType = 'full_report'
  ): string => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format,
      type,
    });

    return `${process.env.NEXT_PUBLIC_API_URL}/analytics/export?${params}`;
  },
};