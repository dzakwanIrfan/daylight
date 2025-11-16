import apiClient from '@/lib/axios';
import { 
  ForgotPasswordDto, 
  LoginDto, 
  RegisterDto, 
  ResendVerificationDto, 
  ResetPasswordDto 
} from '@/types/auth.types';

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
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  logoutAll: async () => {
    const response = await apiClient.post('/auth/logout-all');
    return response.data;
  },

  /**
   * Backend akan encode ke state parameter OAuth
   */
  googleLogin: (sessionId?: string) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    
    if (sessionId) {
      // Registration flow - kirim sessionId
      const url = `${baseUrl}?sessionId=${encodeURIComponent(sessionId)}`;
      window.location.href = url;
    } else {
      // Login flow - no sessionId
      window.location.href = baseUrl;
    }
  },
};