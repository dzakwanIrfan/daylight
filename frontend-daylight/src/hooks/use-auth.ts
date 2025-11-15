'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { userService } from '@/services/user.service';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, setAuth, accessToken, isHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const authenticated = isAuthenticated();

        if (requireAuth && !authenticated) {
          if (!pathname.startsWith('/auth')) {
            router.replace('/auth/login');
          }
          return;
        }

        // Sync profile if authenticated
        if (authenticated && accessToken && user) {
          try {
            const profile = await userService.getProfile();
            if (profile && JSON.stringify(profile) !== JSON.stringify(user)) {
              setAuth(profile, accessToken);
            }
          } catch (error: any) {
            if (error?.response?.status === 401) {
              useAuthStore.getState().clearAuth();
              if (requireAuth && !pathname.startsWith('/auth')) {
                router.replace('/auth/login?session=expired');
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
      } finally {
        setIsLoading(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isHydrated, pathname, requireAuth]);

  return { 
    isAuthenticated: isAuthenticated(), 
    user,
    isChecking,
    isLoading
  };
}