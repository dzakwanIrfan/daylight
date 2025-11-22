import { toast } from 'sonner';
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
  isTestCompleted: boolean;
  completedAt?: number;
  setSessionId: (sessionId: string) => void;
  setAnswer: (questionNumber: number, selectedOption: string) => void;
  setCurrentQuestion: (questionNumber: number) => void;
  setContextData: (data: {
    relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';
    intentOnDaylight?: string[];
    genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
  }) => void;
  setTestCompleted: () => void;
  reset: () => void;
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const usePersonalityTestStore = create<PersonalityTestState>()(
  persist(
    (set, get) => ({
      sessionId: '',
      answers: [],
      currentQuestion: 1,
      relationshipStatus: undefined,
      intentOnDaylight: undefined,
      genderMixComfort: undefined,
      isTestCompleted: false,
      completedAt: undefined,
      
      setSessionId: (sessionId) => {
        set({ sessionId });
      },
      
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
      
      setTestCompleted: () => set({ 
        isTestCompleted: true,
        completedAt: Date.now() 
      }),
      
      reset: () => {
        set({
          sessionId: '',
          answers: [],
          currentQuestion: 1,
          relationshipStatus: undefined,
          intentOnDaylight: undefined,
          genderMixComfort: undefined,
          isTestCompleted: false,
          completedAt: undefined,
        });
      },
    }),
    {
      name: 'personality-test-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Auto-clear data jika sudah lebih dari 7 hari sejak completed
        if (state.isTestCompleted && state.completedAt) {
          const daysSinceCompletion = Date.now() - state.completedAt;
          
          if (daysSinceCompletion > SEVEN_DAYS) {
            state.reset();
            return;
          }
        }
        
        if (state.sessionId && !state.isTestCompleted && state.answers && state.answers.length > 0) {
          toast.success('Resumed your persona test session.');
        }
      },
    }
  )
);