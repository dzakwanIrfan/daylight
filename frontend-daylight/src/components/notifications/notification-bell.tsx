'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageCircle,
  Users,
  Calendar,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { type Notification } from '@/store/notification-store';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current. contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document. addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && !hasLoadedRef.current) {
      setIsLoading(true);
      loadNotifications()
        .then(() => {
          hasLoadedRef.current = true;
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, loadNotifications]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageCircle className="w-4 h-4 text-brand" />;
      case 'GROUP_MATCHED':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'EVENT_REMINDER':
        return <Calendar className="w-4 h-4 text-orange-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    if (notification.referenceType === 'message' && notification.metadata?.groupId) {
      return `/chat? group=${notification.metadata.groupId}`;
    }
    if (notification.referenceType === 'event' && notification.referenceId) {
      return `/events/${notification.referenceId}`;
    }
    if (notification.referenceType === 'matching_group' && notification.metadata?. groupId) {
      return `/chat?group=${notification. metadata.groupId}`;
    }
    return null;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (! notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    e.preventDefault();
    await deleteNotification(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(! isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] sm:text-xs rounded-full min-w-[18px] sm:min-w-5 h-[18px] sm:h-5 flex items-center justify-center px-1 font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={cn(
              'fixed md:absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col',
              // Mobile: bottom sheet style
              'inset-x-2 bottom-2 top-auto max-h-[70vh]',
              // Desktop: dropdown style
              'md:inset-auto md:right-0 md:top-full md:mt-2 md:w-96 md:max-h-[80vh]'
            )}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg">Notifications</h3>
                {! isConnected && (
                  <span className="text-[10px] sm:text-xs text-orange-600 bg-orange-50 px-1. 5 sm:px-2 py-0.5 rounded-full">
                    Offline
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] sm:text-xs text-brand hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1. 5 hover:bg-gray-100 rounded-full md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="p-6 sm:p-8 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-brand" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-muted-foreground text-xs sm:text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 20).map((notification) => {
                    const link = getNotificationLink(notification);

                    const content = (
                      <div
                        className={cn(
                          'p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group',
                          ! notification.isRead && 'bg-brand/5'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-2 sm:gap-3">
                          {/* Icon */}
                          <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-6">
                            <p
                              className={cn(
                                'text-xs sm:text-sm line-clamp-1',
                                ! notification.isRead && 'font-semibold'
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>

                          {/* Unread indicator & Delete */}
                          <div className="absolute right-2 sm:right-3 top-3 flex items-center gap-1 sm:gap-2">
                            {! notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-brand" />
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );

                    return link ?  (
                      <Link key={notification.id} href={link} className="block">
                        {content}
                      </Link>
                    ) : (
                      <div key={notification. id}>{content}</div>
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