'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { PageLoader } from '@/components/ui/page-loader';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isProcessing, setIsProcessing] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      const success = searchParams.get('success');
      const tokenFromUrl = searchParams.get('token');
      const raw = localStorage.getItem('personality-test-storage');

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const id = parsed?.state?.sessionId;
          setSessionId(id);
          console.log('Retrieved sessionId from storage:', sessionId);
        } catch (err) {
          console.error("Failed to parse storage", err);
        }
      }

      if (success === 'true' && tokenFromUrl) {
        try {
          // Store token in httpOnly cookie (via API call)
          
          // Set token temporarily in state for the profile request
          useAuthStore.getState().setAccessToken(tokenFromUrl);
          
          // Fetch user profile with the token
          const profile = await userService.getProfile();
          
          // Set auth in store
          setAuth(profile, tokenFromUrl);
          
          // Clear URL parameters for security
          window.history.replaceState({}, '', '/auth/callback?success=true');
          
          toast.success('Login successful!', {
            description: `Welcome back, ${profile.firstName}!`,
          });

          // Redirect to homepage
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 500);
          
        } catch (error: any) {
          toast.error('Authentication failed', {
            description: error.message || 'Please try logging in again.',
          });
          router.push('/auth/login');
        }
      } else {
        toast.error('Authentication failed');
        router.push('/auth/login');
      }
      
      setIsProcessing(false);
    };

    processAuth();
  }, [searchParams, router, setAuth]);

  return <PageLoader />;
}