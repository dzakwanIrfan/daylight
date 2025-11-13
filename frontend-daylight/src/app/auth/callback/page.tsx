'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { PageLoader } from '@/components/ui/page-loader';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const success = searchParams.get('success');

    if (success === 'true') {
      // Cookies sudah di-set oleh backend
      toast.success('Login successful!');
      
      // Redirect ke homepage
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } else {
      toast.error('Authentication failed');
      router.push('/auth/login');
    }
  }, [searchParams, router]);

  return <PageLoader />;
}