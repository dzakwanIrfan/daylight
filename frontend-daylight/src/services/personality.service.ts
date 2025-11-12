import apiClient from '@/lib/axios';

export interface Answer {
  questionNumber: number;
  selectedOption: string;
}

export interface SubmitPersonalityTestDto {
  sessionId: string;
  answers: Answer[];
  relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';
  intentOnDaylight?: string[];
  genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
}

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
};