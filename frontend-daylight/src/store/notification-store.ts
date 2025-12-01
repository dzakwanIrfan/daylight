import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NotificationType = 'NEW_MESSAGE' | 'GROUP_MATCHED' | 'EVENT_REMINDER' | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  readAt: string | null;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasLoaded: boolean;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setHasLoaded: (loaded: boolean) => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasLoaded: false,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      ... initialState,

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
          hasLoaded: true,
        }),

      addNotification: (notification) =>
        set((state) => {
          // Prevent duplicates
          if (state.notifications.some((n) => n.id === notification. id)) {
            return state;
          }

          return {
            notifications: [notification, ...state.notifications]. slice(0, 100), // Keep max 100
            unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
          };
        }),

      markAsRead: (notificationId) =>
        set((state) => {
          const notification = state.notifications. find((n) => n.id === notificationId);
          if (! notification || notification.isRead) return state;

          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId ?  { ...n, isRead: true, readAt: new Date(). toISOString() } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
            readAt: n.readAt || new Date().toISOString(),
          })),
          unreadCount: 0,
        })),

      deleteNotification: (notificationId) =>
        set((state) => {
          const notification = state.notifications. find((n) => n.id === notificationId);
          return {
            notifications: state.notifications.filter((n) => n. id !== notificationId),
            unreadCount:
              notification && !notification.isRead
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
          };
        }),

      setUnreadCount: (count) => set({ unreadCount: count }),

      setLoading: (isLoading) => set({ isLoading }),

      setHasLoaded: (hasLoaded) => set({ hasLoaded }),

      reset: () => set(initialState),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        unreadCount: state. unreadCount,
      }),
    }
  )
);