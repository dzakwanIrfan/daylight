import apiClient from '@/lib/axios';
import type { Notification } from '@/store/notification-store';

export const notificationService = {
  /**
   * Get user notifications
   */
  getUserNotifications: async (
    unreadOnly = false,
    limit = 50
  ): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications', {
      params: { unreadOnly, limit },
    });
    return response.data. notifications;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string): Promise<boolean> => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data.success;
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.patch('/notifications/read-all');
    return response. data.count;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data. success;
  },
};