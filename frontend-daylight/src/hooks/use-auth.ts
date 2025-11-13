'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { userService } from '@/services/user.service';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, user, setAuth, accessToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUserProfile = async () => {
      setIsLoading(true);
      
      try {
        const authenticated = isAuthenticated();
        
        if (requireAuth && !authenticated) {
          router.replace('/auth/login');
          return;
        }

        // Sync user profile from backend if authenticated
        if (authenticated && accessToken) {
          try {
            const profile = await userService.getProfile();
            if (profile && user) {
              // Update store with latest profile data
              setAuth(profile, accessToken);
            }
          } catch (error) {
            console.error('Failed to sync profile:', error);
            // If token is invalid, clear auth
            if ((error as any)?.response?.status === 401) {
              useAuthStore.getState().clearAuth();
              if (requireAuth) {
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

    syncUserProfile();
  }, [requireAuth, isAuthenticated, router, accessToken, user?.id]);

  return { 
    isAuthenticated: isAuthenticated(), 
    user,
    isChecking,
    isLoading
  };
}