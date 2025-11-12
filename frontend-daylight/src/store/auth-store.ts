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
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
      isAuthenticated: () => {
        const state = get();
        return !!state.accessToken && !!state.user;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);