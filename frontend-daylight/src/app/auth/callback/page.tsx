'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/axios';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Processing authentication...');
  
  // Use ref to prevent double execution in React Strict Mode
  const hasProcessed = useRef(false);

  useEffect(() => {
    // If already processed, skip
    if (hasProcessed.current) {
      return;
    }

    const processAuth = async () => {
      try {
        const success = searchParams.get('success');
        const accessToken = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');

        if (success !== 'true') {
          throw new Error('Authentication failed. Please try again.');
        }

        if (!accessToken || !refreshToken) {
          throw new Error('No authentication tokens received. Please try again.');
        }

        // MARK as processed BEFORE any async operations
        hasProcessed.current = true;

        setMessage('Establishing secure session...');

        // STEP 1: Call backend to set httpOnly cookies
        await apiClient.post('/auth/session-login', {
          accessToken,
          refreshToken,
        });

        setMessage('Fetching your profile...');

        // STEP 2: Store token temporarily for profile request
        useAuthStore.getState().setAccessToken(accessToken);

        // STEP 3: Fetch user profile
        const profile = await userService.getProfile();

        // STEP 4: Set auth in store (persists to localStorage)
        setAuth(profile, accessToken);

        setMessage('Login successful! Redirecting...');

        toast.success('Welcome to DayLight!', {
          description: `Hello ${profile.firstName}!`,
          duration: 3000,
        });

        // STEP 5: Clear sensitive data from URL
        window.history.replaceState({}, '', '/auth/callback');

        // STEP 6: Redirect to events page
        setTimeout(() => {
          router.push('/events');
          router.refresh();
        }, 1000);
        
      } catch (error: any) {
        
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Authentication failed. Please try again.';
        
        setError(errorMessage);
        
        toast.error('Authentication Failed', {
          description: errorMessage,
          duration: 5000,
        });

        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    if (searchParams) {
      processAuth();
    }
  }, [searchParams, router, setAuth]);

  // Loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{message}</h2>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Authentication Failed</h2>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <p className="text-xs text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Success!</h2>
          <p className="text-sm text-gray-600">Redirecting to events...</p>
        </div>
      </div>
    </div>
  );
}