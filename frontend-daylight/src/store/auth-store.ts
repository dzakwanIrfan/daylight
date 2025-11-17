import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SubscriptionInfo {
  id: string;
  planId: string;
  planName: string;
  planType: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

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
  hasActiveSubscription?: boolean;
  subscription?: SubscriptionInfo | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null; // optional, tidak lagi diambil dari cookie
  isHydrated: boolean;
  setAuth: (user: User, accessToken?: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
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

      // Bisa dipanggil dengan setAuth(user) atau setAuth(user, accessToken)
      setAuth: (user, accessToken = null) => {
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

        // hindari false positive sebelum hydrate
        if (!state.isHydrated && typeof window !== 'undefined') {
          return false;
        }

        // Cukup cek ada user atau tidak
        return !!state.user;
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
