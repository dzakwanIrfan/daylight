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
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) {
      return;
    }

    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const authenticated = isAuthenticated();
        
        // Redirect if auth required but not authenticated
        if (requireAuth && !authenticated) {
          if (!pathname.startsWith('/auth')) {
            router.replace('/auth/login');
          }
          return;
        }

        // Sync profile once if authenticated and haven't synced yet
        if (authenticated && accessToken && user && !hasSynced) {
          try {
            const profile = await userService.getProfile();
            if (profile && JSON.stringify(profile) !== JSON.stringify(user)) {
              setAuth(profile, accessToken);
            }
            setHasSynced(true);
          } catch (error: any) {
            console.error('Failed to sync profile:', error);
            if (error?.response?.status === 401) {
              useAuthStore.getState().clearAuth();
              if (requireAuth && !pathname.startsWith('/auth')) {
                router.replace('/auth/login');
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isHydrated]); // Only run when hydrated changes

  return { 
    isAuthenticated: isAuthenticated(), 
    user,
    isChecking,
    isLoading
  };
}