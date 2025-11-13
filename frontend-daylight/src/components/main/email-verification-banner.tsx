'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { emailService } from '@/services/email.service';
import { useAuthStore } from '@/store/auth-store';

export function EmailVerificationBanner() {
  const user = useAuthStore((state) => state.user);
  const [isVisible, setIsVisible] = useState(true);

  const resendMutation = useMutation({
    mutationFn: emailService.sendVerificationEmail,
    onSuccess: () => {
      toast.success('Verification email sent!', {
        description: 'Please check your inbox.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to send email', {
        description: error.response?.data?.message || 'Please try again later',
      });
    },
  });

  // Don't show if email is verified or user closed it or user doesn't exist
  // Using optional chaining to safely check isEmailVerified
  if (!user || user.isEmailVerified === true || !isVisible) {
    return null;
  }

  return (
    <Alert className="relative mb-6 border-brand/50 bg-brand/5">
      <Mail className="h-4 w-4 text-brand" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium">Verify your email address</p>
          <p className="text-sm text-muted-foreground">
            Please check your inbox and verify your email to access all features.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Email'
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}