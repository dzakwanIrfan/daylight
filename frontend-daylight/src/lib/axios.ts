import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { parseApiError } from './api-error';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // penting supaya cookie ikut terkirim
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

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    // OPTIONAL: kalau backend masih baca Authorization header, kita bantu kirimkan.
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

      // Kalau error datang dari endpoint auth sendiri, langsung lempar
      if (isAuthEndpoint) {
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
      isRefreshing = false;

      try {
        isRefreshing = true;

        // refresh pakai refreshToken di HttpOnly cookie
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
        } else {
          processQueue(null, null);
        }

        // ulang request awal
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();

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

        return Promise.reject(parseApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(parseApiError(error));
  }
);

export default apiClient;
