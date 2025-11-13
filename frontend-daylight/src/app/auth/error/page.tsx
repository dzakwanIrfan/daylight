'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}