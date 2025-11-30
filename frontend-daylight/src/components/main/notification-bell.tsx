'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Loader2 } from 'lucide-react';
import { useNotificationStore, type Notification } from '@/store/notification-store';
import { notificationService } from '@/services/notification.service';
import { useSocket } from '@/hooks/use-socket';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const { notifications, unreadCount, addNotification, markAsRead, setNotifications, setUnreadCount } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { on, off, isConnected } = useSocket({ namespace: '/chat' });

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const [userNotifications, count] = await Promise.all([
        notificationService.getUserNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(userNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for new notifications via socket
  useEffect(() => {
    if (! isConnected) return;

    const handleNewNotification = (data: any) => {
      toast. info(data.title || 'New notification');
      loadNotifications();
    };

    on('notification:new', handleNewNotification);

    return () => {
      off('notification:new', handleNewNotification);
    };
  }, [isConnected, on, off]);

  // Load on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.type === 'NEW_MESSAGE' && notification.metadata?.groupId) {
      return `/chat? group=${notification.metadata.groupId}`;
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ?  '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand" />
                </div>
              ) : notifications. length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => {
                    const link = getNotificationLink(notification);
                    const Component = link ? Link : 'div';

                    return (
                      <Component
                        key={notification.id}
                        href={link || ''}
                        onClick={() => {
                          if (! notification.isRead) {
                            handleMarkAsRead(notification.id);
                          }
                          if (link) {
                            setIsOpen(false);
                          }
                        }}
                        className={cn(
                          'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                          ! notification.isRead && 'bg-brand/5'
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2 shrink-0',
                            ! notification.isRead ?  'bg-brand' : 'bg-transparent'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </Component>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}