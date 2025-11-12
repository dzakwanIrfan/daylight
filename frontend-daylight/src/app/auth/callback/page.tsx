'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          firstName: payload.firstName || null,
          lastName: payload.lastName || null,
        };
        
        // Set auth akan otomatis set cookie juga
        setAuth(user, accessToken, refreshToken);
        
        toast.success('Login successful!');
        
        // Force hard navigation untuk trigger middleware
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (error) {
        toast.error('Authentication failed');
        router.push('/login');
      }
    } else {
      toast.error('Authentication failed');
      router.push('/login');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin mx-auto text-brand" />
        <p className="text-xl font-semibold">Authenticating...</p>
      </div>
    </div>
  );
}