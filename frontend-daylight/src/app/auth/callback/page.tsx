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
    if (!searchParams) return;

    const processAuth = async () => {
      try {
        const success = searchParams.get('success');

        if (success !== 'true') {
          throw new Error('Authentication failed. Please try again.');
        }

        hasProcessed.current = true;

        setMessage('Verifying session...');

        // beri waktu supaya Set-Cookie dari backend sudah settle
        await new Promise((resolve) => setTimeout(resolve, 800));

        setMessage('Fetching your profile...');

        // Cookie HttpOnly otomatis dikirim oleh browser via withCredentials
        const profile = await userService.getProfile();
        console.log('Fetched profile:', profile);

        if (!profile) {
          throw new Error('Failed to retrieve user profile.');
        }

        // SIMPAN USER DI STORE
        // accessToken tidak diambil dari cookie lagi
        setAuth(profile, null);
        console.log('User authenticated with HttpOnly cookie:', profile);

        setMessage('Login successful! Redirecting...');

        toast.success('Welcome to DayLight!', {
          description: `Hello ${profile.firstName}!`,
          duration: 3000,
        });

        // bersihkan query params
        window.history.replaceState({}, '', '/auth/callback');

        setTimeout(() => {
          router.push('/events');
          router.refresh();
        }, 1000);
      } catch (err: any) {
        console.error('❌ Auth callback error:', err);

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
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

    processAuth();
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
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Failed
            </h2>
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
