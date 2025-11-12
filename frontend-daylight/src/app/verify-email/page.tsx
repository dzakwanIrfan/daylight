'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { emailService } from '@/services/email.service';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const verifyMutation = useMutation({
    mutationFn: (token: string) => emailService.verifyEmail(token),
    onSuccess: () => {
      setVerificationStatus('success');
      toast.success('Email verified!', {
        description: 'Your email has been successfully verified.',
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      toast.error('Verification failed', {
        description:
          error.response?.data?.message || 'Invalid or expired token',
      });
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setVerificationStatus('error');
    }
  }, [token]);

  const handleResend = () => {
    router.push('/dashboard/profile');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {verificationStatus === 'pending' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10">
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
                <h2 className="text-2xl font-heading font-bold">
                  Verifying Your Email
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-heading font-bold">
                  Email Verified!
                </h2>
                <p className="text-muted-foreground">
                  Your email has been successfully verified. Redirecting to
                  dashboard...
                </p>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-heading font-bold">
                  Verification Failed
                </h2>
                <p className="text-muted-foreground">
                  The verification link is invalid or has expired. Please
                  request a new verification email.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={handleResend}
                    className="bg-brand hover:bg-brand-orange-dark"
                  >
                    Go to Profile
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}