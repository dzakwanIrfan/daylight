import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Answer {
  questionNumber: number;
  selectedOption: string;
}

interface PersonalityTestState {
  sessionId: string;
  answers: Answer[];
  currentQuestion: number;
  relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';
  intentOnDaylight?: string[];
  genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
  setSessionId: (sessionId: string) => void;
  setAnswer: (questionNumber: number, selectedOption: string) => void;
  setCurrentQuestion: (questionNumber: number) => void;
  setContextData: (data: {
    relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';
    intentOnDaylight?: string[];
    genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
  }) => void;
  reset: () => void;
}

export const usePersonalityTestStore = create<PersonalityTestState>()(
  persist(
    (set) => ({
      sessionId: '',
      answers: [],
      currentQuestion: 1,
      relationshipStatus: undefined,
      intentOnDaylight: undefined,
      genderMixComfort: undefined,
      setSessionId: (sessionId) => set({ sessionId }),
      setAnswer: (questionNumber, selectedOption) =>
        set((state) => {
          const existingIndex = state.answers.findIndex(
            (a) => a.questionNumber === questionNumber
          );
          const newAnswers = [...state.answers];

          if (existingIndex >= 0) {
            newAnswers[existingIndex] = { questionNumber, selectedOption };
          } else {
            newAnswers.push({ questionNumber, selectedOption });
          }

          return { answers: newAnswers };
        }),
      setCurrentQuestion: (questionNumber) =>
        set({ currentQuestion: questionNumber }),
      setContextData: (data) => set(data),
      reset: () =>
        set({
          sessionId: '',
          answers: [],
          currentQuestion: 1,
          relationshipStatus: undefined,
          intentOnDaylight: undefined,
          genderMixComfort: undefined,
        }),
    }),
    {
      name: 'personality-test-storage',
    }
  )
);