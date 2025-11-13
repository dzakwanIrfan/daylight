import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      
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
        // ✅ Check both store token AND cookie
        if (typeof window !== 'undefined') {
          const hasCookie = document.cookie.includes('accessToken=');
          return (!!state.accessToken || hasCookie) && !!state.user;
        }
        return !!state.accessToken && !!state.user;
      },
    }),
    {
      name: 'auth-storage',
      // ✅ Persist both user AND accessToken
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken 
      }),
    }
  )
);