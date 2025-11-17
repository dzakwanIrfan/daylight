import apiClient from '@/lib/axios';
import { 
  ForgotPasswordDto, 
  LoginDto, 
  RegisterDto, 
  ResendVerificationDto, 
  ResetPasswordDto 
} from '@/types/auth.types';

// Helper to clear all auth cookies on client
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

export const authService = {
  login: async (data: LoginDto) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (data: ResendVerificationDto) => {
    const response = await apiClient.post('/auth/resend-verification', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordDto) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordDto) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      clearAuthCookies();
      return response.data;
    } catch (error: any) {
      // Even if backend fails, clear cookies on client
      clearAuthCookies();
      
      // If it's 401, it means token already invalid, so treat as success
      if (error?.response?.status === 401) {
        return { success: true, message: 'Logged out successfully' };
      }
      
      throw error;
    }
  },

  logoutAll: async () => {
    try {
      const response = await apiClient.post('/auth/logout-all');
      clearAuthCookies();
      return response.data;
    } catch (error: any) {
      // Even if backend fails, clear cookies on client
      clearAuthCookies();
      
      // If it's 401, it means token already invalid, so treat as success
      if (error?.response?.status === 401) {
        return { success: true, message: 'Logged out from all devices' };
      }
      
      throw error;
    }
  },

  /**
   * Force logout - clears everything without backend call
   * Use this when backend is unreachable or tokens are completely invalid
   */
  forceLogout: () => {
    clearAuthCookies();
    return { success: true, message: 'Logged out successfully' };
  },

  googleLogin: (sessionId?: string) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    
    if (sessionId) {
      const url = `${baseUrl}?sessionId=${encodeURIComponent(sessionId)}`;
      window.location.href = url;
    } else {
      window.location.href = baseUrl;
    }
  },
};