'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analyticsService } from '@/services/analytics.service';

interface AnalyticsContextValue {
  trackEvent: (eventName: string, data?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageViewIdRef = useRef<string | null>(null);
  const pageEnterTimeRef = useRef<number>(Date.now());

  // Track page view on route change
  useEffect(() => {
    const trackPage = async () => {
      // Send duration of previous page if exists
      if (pageViewIdRef.current) {
        const duration = (Date.now() - pageEnterTimeRef.current) / 1000;
        await analyticsService.updateDuration(pageViewIdRef.current, duration);
      }

      // Track new page
      pageEnterTimeRef.current = Date.now();
      const result = await analyticsService.trackPageView(pathname);
      
      if (result.success && result.id) {
        pageViewIdRef.current = result.id;
      }
    };

    trackPage();

    // Cleanup: send duration when leaving page
    return () => {
      if (pageViewIdRef.current) {
        const duration = (Date.now() - pageEnterTimeRef.current) / 1000;
        // Use sendBeacon for reliable delivery on page unload
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/track/${pageViewIdRef.current}/duration`;
          const data = JSON.stringify({ duration: Math.round(duration) });
          navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
        }
      }
    };
  }, [pathname, searchParams]);

  // Track page unload/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pageViewIdRef.current) {
        const duration = (Date.now() - pageEnterTimeRef.current) / 1000;
        
        if (navigator.sendBeacon) {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/track/${pageViewIdRef.current}/duration`;
          const data = JSON.stringify({ duration: Math.round(duration) });
          navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
        }
      }
    };

    const handleBeforeUnload = () => {
      if (pageViewIdRef.current) {
        const duration = (Date.now() - pageEnterTimeRef.current) / 1000;
        
        if (navigator.sendBeacon) {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/analytics/track/${pageViewIdRef.current}/duration`;
          const data = JSON.stringify({ duration: Math.round(duration) });
          navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Custom event tracking (for future use)
  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    console.log('Track event:', eventName, data);
    // Can be extended to track custom events
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}