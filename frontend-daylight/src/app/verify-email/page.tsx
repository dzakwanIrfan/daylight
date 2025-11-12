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
      if (data.success && data.user && data.accessToken && data.refreshToken) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/');
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
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-brand" />
            <p className="text-xl font-semibold">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <p className="text-xl font-semibold">Email Verified!</p>
              <p className="text-muted-foreground mt-2">
                Redirecting to login page...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
            <div>
              <p className="text-xl font-semibold">Verification Failed</p>
              <p className="text-muted-foreground mt-2">
                The verification link may be invalid or expired.
              </p>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-brand hover:bg-brand/90"
            >
              Go to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}