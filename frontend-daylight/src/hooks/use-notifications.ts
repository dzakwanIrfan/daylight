'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from './use-socket';
import { useNotificationStore, type Notification } from '@/store/notification-store';
import { useAuthStore } from '@/store/auth-store';
import { notificationService } from '@/services/notification.service';
import { toast } from 'sonner';

export function useNotifications() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setUnreadCount,
  } = useNotificationStore();

  const { isConnected, emit, on, off } = useSocket({
    namespace: '/chat',
    autoConnect: true,
  });

  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const listenersSetupRef = useRef(false);

  /**
   * Load notifications from server
   */
  const loadNotifications = useCallback(
    async (unreadOnly = false) => {
      if (isLoadingRef.current) return notifications;

      isLoadingRef.current = true;

      try {
        const notifs = await notificationService.getUserNotifications(unreadOnly);
        setNotifications(notifs);
        hasLoadedRef.current = true;
        return notifs;
      } catch (error) {
        console. error('❌ Failed to load notifications:', error);
        return [];
      } finally {
        isLoadingRef.current = false;
      }
    },
    [setNotifications, notifications]
  );

  /**
   * Load unread count
   */
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error('❌ Failed to load unread count:', error);
      return 0;
    }
  }, [setUnreadCount]);

  /**
   * Mark notification as read
   */
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        markAsRead(notificationId);
      } catch (error) {
        console.error('❌ Failed to mark as read:', error);
      }
    },
    [markAsRead]
  );

  /**
   * Mark all as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
    }
  }, [markAllAsRead]);

  /**
   * Delete notification
   */
  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.deleteNotification(notificationId);
        deleteNotification(notificationId);
      } catch (error) {
        console.error('❌ Failed to delete notification:', error);
      }
    },
    [deleteNotification]
  );

  /**
   * Show toast notification
   */
  const showNotificationToast = useCallback((notification: Notification) => {
    const toastOptions = {
      duration: 5000,
      action: notification.metadata?.groupId
        ? {
            label: 'View',
            onClick: () => {
              window.location.href = `/chat?group=${notification.metadata?.groupId}`;
            },
          }
        : undefined,
    };

    switch (notification.type) {
      case 'NEW_MESSAGE':
        toast.info(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case 'GROUP_MATCHED':
        toast.success(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case 'EVENT_REMINDER':
        toast.warning(notification. title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      default:
        toast(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
    }
  }, []);

  /**
   * Setup realtime notification listeners
   */
  useEffect(() => {
    if (! isConnected || listenersSetupRef.current) return;

    listenersSetupRef.current = true;
    console.log('🔔 Setting up notification listeners');

    const handleNewNotification = (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      addNotification(notification);
      showNotificationToast(notification);
    };

    // Listen for new notifications
    on('notification:new', handleNewNotification);
    on('notification', handleNewNotification);

    return () => {
      console.log('🔔 Removing notification listeners');
      off('notification:new', handleNewNotification);
      off('notification', handleNewNotification);
      listenersSetupRef.current = false;
    };
  }, [isConnected, on, off, addNotification, showNotificationToast]);

  /**
   * Join user notification room when connected
   */
  useEffect(() => {
    if (! isConnected || !user?. id) return;

    // Join user-specific room for notifications
    emit('join:user', { userId: user. id }, (response: any) => {
      if (response?. success) {
        console.log('✅ Joined user notification room');
      }
    });
  }, [isConnected, user?.id, emit]);

  /**
   * Initial load - only unread count
   */
  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      loadUnreadCount();
    }
  }, [user, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    isConnected,
    loadNotifications,
    loadUnreadCount,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };
}