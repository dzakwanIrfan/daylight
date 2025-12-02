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

interface CityInfo {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  country: {
    id: string;
    code: string;
    name: string;
    currency: string;
  };
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
  currentCityId?: string | null;
  currentCity?: CityInfo | null;
}

interface AuthState {
  user: User | null;
  isHydrated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isHydrated: false,

      setAuth: (user) => {
        set({ user });
      },

      clearAuth: () => {
        set({ user: null });
      },

      isAuthenticated: () => {
        const state = get();
        if (!state.isHydrated && typeof window !== 'undefined') {
          return false;
        }
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
      }),
      onRehydrateStorage: () => (state) => {
        state?. setHydrated();
      },
    }
  )
);