'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  const verifyMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (data) => {
      setStatus('success');
      if (data.success && data.user && data.accessToken) {
        setAuth(data.user, data.accessToken);
        toast.success('Email verified successfully!', {
          description: 'Welcome to DayLight!',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    },
    onError: (error: any) => {
      setStatus('error');
      toast.error('Verification failed', {
        description: error.response?.data?.message || 'Invalid or expired token',
      });
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('error');
      toast.error('No verification token provided');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 to-white p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-brand logo-text">DayLight</h1>
        
        {status === 'verifying' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-brand" />
            </div>
            <p className="text-xl font-semibold">Verifying your email...</p>
            <p className="text-sm text-muted-foreground">
              This will only take a moment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold">Email Verified! 🎉</p>
              <p className="text-muted-foreground mt-2">
                Your account has been successfully verified.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Redirecting to your dashboard...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <div>
              <p className="text-xl font-semibold">Verification Failed</p>
              <p className="text-muted-foreground mt-2">
                The verification link may be invalid or expired.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please request a new verification email or contact support.
              </p>
            </div>
            <div className="space-y-3 mt-6">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-brand hover:bg-brand/90 border border-r-4 border-b-4 border-black rounded-full font-bold text-white"
              >
                Go to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}