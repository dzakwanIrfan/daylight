import apiClient from '@/lib/axios';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  sessionId: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginDto) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await apiClient.post('/auth/register', data);
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

  googleLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },
};