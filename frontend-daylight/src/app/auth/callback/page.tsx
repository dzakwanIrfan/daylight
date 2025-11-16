'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Processing authentication...');
  
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const processAuth = async () => {
      try {
        const success = searchParams?.get('success');

        if (success !== 'true') {
          throw new Error('Authentication failed. Please try again.');
        }

        hasProcessed.current = true;

        setMessage('Verifying session...');

        // Tunggu sebentar agar cookies ter-set dengan benar dari redirect
        await new Promise(resolve => setTimeout(resolve, 800));

        setMessage('Fetching your profile...');

        // Fetch user profile (cookies sudah ada dari backend redirect)
        const profile = await userService.getProfile();
        
        // Get token from cookie untuk store
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

        if (!profile) {
          throw new Error('Failed to retrieve user profile.');
        }

        if (!token) {
          throw new Error('No authentication token found. Please try logging in again.');
        }

        // Set auth in store
        setAuth(profile, token);

        setMessage('Login successful! Redirecting...');

        toast.success('Welcome to DayLight!', {
          description: `Hello ${profile.firstName}!`,
          duration: 3000,
        });

        // Clear URL parameters
        window.history.replaceState({}, '', '/auth/callback');

        // Redirect
        setTimeout(() => {
          router.push('/events');
          router.refresh();
        }, 1000);
        
      } catch (error: any) {
        console.error('❌ Auth callback error:', error);
        
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