'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Authentication failed';

  useEffect(() => {
    if (message === 'Please complete the persona test first') {
      toast.error('Please complete the persona test first');
      router.push('/personality-test');
    }
  }, [message, router]);

  // Don't render content if we are redirecting
  if (message === 'Please complete the persona test first') {
    return null;
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-destructive/10">
      <CardHeader className="text-center space-y-4 pb-2">
        <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-base">
            We encountered an issue while signing you in.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-center pb-2">
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-foreground font-medium">{message}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-6">
        <Button className="w-full" asChild>
          <Link href="/auth/login">
            <RotateCw className="w-4 h-4 mr-2" />
            Try Again
          </Link>
        </Button>
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Suspense fallback={null}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
