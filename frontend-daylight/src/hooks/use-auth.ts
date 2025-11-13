'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Delay check untuk menghindari flicker
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      
      if (requireAuth && !authenticated) {
        router.replace('/auth/login');
      }
      
      setIsChecking(false);
    };

    // Check auth setelah component mount
    checkAuth();
  }, [requireAuth, isAuthenticated, router]);

  return { 
    isAuthenticated: isAuthenticated(), 
    user,
    isChecking 
  };
}