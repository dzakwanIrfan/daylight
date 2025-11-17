'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, setAuth, accessToken, isHydrated, clearAuth } = useAuthStore();
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
          setIsLoading(false);
          setIsChecking(false);
          return;
        }

        // Sync profile if authenticated
        if (authenticated && accessToken) {
          try {
            // Try to fetch profile to validate token
            const profile = await userService.getProfile();
            
            // Update store with fresh profile data
            setAuth(profile, accessToken);
          } catch (error: any) {
            // Token is invalid
            if (error?.response?.status === 401) {
              console.error('❌ Token validation failed, clearing auth');
              
              // Clear auth state completely
              clearAuth();
              
              // Clear cookies manually as well
              if (typeof document !== 'undefined') {
                const cookieOptions = '; path=/; domain=' + window.location.hostname.replace('www.', '.');
                document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + cookieOptions;
                document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + cookieOptions;
                
                // Also try without domain
                document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
                document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
              }
              
              // Redirect to login if on protected route
              if (requireAuth && !pathname.startsWith('/auth')) {
                router.replace('/auth/login?session=expired');
              }
            } else {
              // Other errors, just log
              console.error('Profile fetch error:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication check failed. Please try again.');
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