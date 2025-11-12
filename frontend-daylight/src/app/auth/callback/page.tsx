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
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user data
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          setAuth(user, accessToken, refreshToken);
          toast.success('Welcome back!', {
            description: 'You have successfully logged in.',
          });
          router.push('/dashboard');
        })
        .catch(() => {
          toast.error('Authentication failed');
          router.push('/login');
        });
    } else {
      toast.error('Authentication failed');
      router.push('/login');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}