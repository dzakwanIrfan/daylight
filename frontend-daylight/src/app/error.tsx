'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-bold">
            Something went wrong!
          </h2>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="bg-brand hover:bg-brand-orange-dark">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}