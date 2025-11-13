import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

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

// Helper to get token from cookie
function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/accessToken=([^;]+)/);
  return match ? match[1] : null;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try store first, then cookie
    let token = useAuthStore.getState().accessToken;
    
    if (!token) {
      token = getTokenFromCookie();
      
      // Sync to store if found in cookie
      if (token) {
        useAuthStore.getState().setAccessToken(token);
      }
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ IMPROVED: Try to refresh token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.accessToken) {
          // Update store with new token
          useAuthStore.getState().setAccessToken(response.data.accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          }

          // Process queued requests
          processQueue(null, response.data.accessToken);
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        
        if (typeof window !== 'undefined') {
          const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/personality-test'];
          const currentPath = window.location.pathname;
          
          if (!publicPaths.some(path => currentPath.startsWith(path))) {
            window.location.href = '/auth/login?session=expired';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ IMPROVED: For non-401 errors, just reject without refresh
    return Promise.reject(error);
  }
);

export default apiClient;