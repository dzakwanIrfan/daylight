import apiClient from '@/lib/axios';
import { SubmitPersonalityTestDto } from '@/types/personality.types';

export const personalityService = {
  getQuestions: async () => {
    const response = await apiClient.get('/personality/questions');
    return response.data;
  },

  submitTest: async (data: SubmitPersonalityTestDto) => {
    const response = await apiClient.post('/personality/submit', data);
    return response.data;
  },

  getResult: async (sessionId: string) => {
    const response = await apiClient.get(`/personality/result?sessionId=${sessionId}`);
    return response.data;
  },

  // NEW: Get current user's personality result
  getMyResult: async () => {
    const response = await apiClient.get('/personality/my-result');
    return response.data;
  },
};