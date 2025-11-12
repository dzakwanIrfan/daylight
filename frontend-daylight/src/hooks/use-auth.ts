'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated()) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, router]);

  return { isAuthenticated: isAuthenticated(), user };
}