import apiClient from '@/lib/axios';

export const emailService = {
  sendVerificationEmail: async () => {
    const response = await apiClient.post('/auth/send-verification-email');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerificationEmail: async (email: string) => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },
};