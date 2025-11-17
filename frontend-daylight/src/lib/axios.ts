import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { parseApiError } from './api-error';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to clear all auth cookies
const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    const cookieOptions = '; path=/; domain=' + window.location.hostname.replace('www.', '.');
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + cookieOptions;
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + cookieOptions;
    document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + cookieOptions;
    
    // Also try without domain for localhost
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  }
};

// Helper to handle complete logout
const handleCompleteLogout = () => {
  useAuthStore.getState().clearAuth();
  clearAuthCookies();
  
  if (typeof window !== 'undefined') {
    const publicPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/personality-test',
    ];
    const currentPath = window.location.pathname;

    if (!publicPaths.some((path) => currentPath.startsWith(path))) {
      window.location.href = '/auth/login?session=expired';
    }
  }
};

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(parseApiError(error));
  }
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const url = originalRequest.url || '';

      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/verify-email');

      // If error from auth endpoint, clear everything and reject
      if (isAuthEndpoint) {
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
          handleCompleteLogout();
        }
        return Promise.reject(parseApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(parseApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = (response.data as any)?.accessToken || null;

        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          processQueue(null, null);
          isRefreshing = false;
          handleCompleteLogout();
          return Promise.reject(parseApiError(error));
        }
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleCompleteLogout();
        return Promise.reject(parseApiError(refreshError));
      }
    }

    return Promise.reject(parseApiError(error));
  }
);

export default apiClient;