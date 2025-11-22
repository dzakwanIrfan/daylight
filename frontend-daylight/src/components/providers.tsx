'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, Suspense } from 'react';
import { AnalyticsProvider } from './admin/analytics/analytics-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </Suspense>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}