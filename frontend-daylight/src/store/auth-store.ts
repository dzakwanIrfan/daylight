import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
  profilePicture?: string | null;
  provider?: string;
  isEmailVerified?: boolean;
  personalityType?: string;
  role?: 'USER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      
      setAuth: (user, accessToken) => {
        set({ user, accessToken });
      },
      
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      
      clearAuth: () => {
        set({ user: null, accessToken: null });
      },
      
      isAuthenticated: () => {
        const state = get();
        
        // Check if hydrated first
        if (!state.isHydrated && typeof window !== 'undefined') {
          return false;
        }

        if (typeof window !== 'undefined') {
          const hasCookie = document.cookie.includes('accessToken=');
          const hasUser = !!state.user;
          const hasToken = !!state.accessToken;
          
          const result = (hasToken || hasCookie) && hasUser;
          return result;
        }
        
        return !!state.accessToken && !!state.user;
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);