'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from './use-socket';
import { useChatStore, Message } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { chatService } from '@/services/chat.service';
import { toast } from 'sonner';

export function useChat() {
  const { user } = useAuthStore();
  const {
    groups,
    messages,
    activeGroupId,
    typingUsers,
    unreadCounts,
    setGroups,
    addMessage,
    setMessages,
    prependMessages,
    updateMessageStatus,
    addTypingUser,
    removeTypingUser,
    incrementUnread,
    clearUnread,
    setActiveGroup,
  } = useChatStore();

  const { socket, isConnected, emit, on, off } = useSocket({
    namespace: '/chat',
    autoConnect: true,
  });

  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const joinedGroups = useRef<Set<string>>(new Set());
  const hasLoadedGroups = useRef(false);
  const isLoadingGroups = useRef(false);
  const listenersSetup = useRef(false);
  const lastConnectionState = useRef(false);

  /**
   * Load user groups
   */
  const loadGroups = useCallback(async () => {
    if (hasLoadedGroups. current || isLoadingGroups.current) {
      return groups;
    }

    isLoadingGroups.current = true;

    try {
      console.log('📡 Loading user groups.. .');
      const userGroups = await chatService.getUserGroups();
      setGroups(userGroups);
      hasLoadedGroups. current = true;
      console.log(`✅ Loaded ${userGroups.length} groups`);
      return userGroups;
    } catch (error) {
      console.error('❌ Failed to load groups:', error);
      toast.error('Failed to load chat groups');
      return [];
    } finally {
      isLoadingGroups.current = false;
    }
  }, [setGroups, groups]);

  /**
   * Load messages for a group
   */
  const loadMessages = useCallback(
    async (groupId: string, before?: string) => {
      try {
        console. log(`📡 Loading messages for group: ${groupId}`);
        const { messages: groupMessages } = await chatService. getGroupMessages(groupId, {
          limit: 50,
          before,
        });

        if (before) {
          prependMessages(groupId, groupMessages);
        } else {
          setMessages(groupId, groupMessages);
        }

        console.log(`✅ Loaded ${groupMessages.length} messages for group ${groupId}`);
        return groupMessages;
      } catch (error) {
        console. error('❌ Failed to load messages:', error);
        return [];
      }
    },
    [setMessages, prependMessages]
  );

  /**
   * Join a group room
   */
  const joinGroup = useCallback(
    (groupId: string) => {
      if (!isConnected) {
        console.warn('⚠️ Cannot join group: Socket not connected');
        return;
      }

      if (joinedGroups.current.has(groupId)) {
        return;
      }

      console.log('🔗 Joining group:', groupId);

      emit('join:group', { groupId }, (response: any) => {
        if (response?. success) {
          console.log('✅ Joined group:', groupId);
          joinedGroups.current. add(groupId);
        } else {
          console.error('❌ Failed to join group:', response);
        }
      });
    },
    [isConnected, emit]
  );

  /**
   * Leave a group room
   */
  const leaveGroup = useCallback(
    (groupId: string) => {
      if (!isConnected || !joinedGroups.current.has(groupId)) {
        return;
      }

      emit('leave:group', { groupId });
      joinedGroups.current.delete(groupId);
    },
    [isConnected, emit]
  );

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (groupId: string, content: string): Promise<Message | null> => {
      if (!isConnected) {
        toast.error('Not connected to chat server');
        return null;
      }

      const trimmedContent = content. trim();
      if (! trimmedContent) {
        return null;
      }

      return new Promise<Message | null>((resolve) => {
        emit(
          'message:send',
          { content: trimmedContent, groupId },
          (ack: { success: boolean; message?: Message; error?: string }) => {
            if (ack?. success && ack.message) {
              addMessage(groupId, ack. message);
              resolve(ack.message);
            } else {
              toast.error(ack?.error || 'Failed to send message');
              resolve(null);
            }
          }
        );
      });
    },
    [isConnected, emit, addMessage]
  );

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback(
    (groupId: string, isTyping: boolean) => {
      if (!isConnected) return;
      emit('typing', { groupId, isTyping });
    },
    [isConnected, emit]
  );

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(
    (groupId: string, messageIds: string[]) => {
      if (!isConnected || messageIds.length === 0) return;

      emit('messages:read', { messageIds, groupId });
      clearUnread(groupId);
    },
    [isConnected, emit, clearUnread]
  );

  /**
   * Setup socket event listeners
   */
  useEffect(() => {
    if (! isConnected) {
      listenersSetup. current = false;
      return;
    }

    if (listenersSetup.current) {
      return;
    }

    console.log('🎧 Setting up chat event listeners');
    listenersSetup. current = true;

    const handleNewMessage = (message: Message) => {
      console.log('📨 New message received:', message);
      addMessage(message. groupId, message);

      if (message.senderId !== user?.id) {
        const currentActiveGroup = useChatStore.getState().activeGroupId;
        if (currentActiveGroup !== message.groupId) {
          incrementUnread(message. groupId);
        }
      }
    };

    const handleTypingUpdate = (data: {
      userId: string;
      groupId: string;
      isTyping: boolean;
      timestamp: string;
    }) => {
      if (data.userId === user?.id) return;

      if (data.isTyping) {
        addTypingUser({
          userId: data.userId,
          groupId: data. groupId,
          timestamp: new Date(data.timestamp),
        });

        const key = `${data. groupId}-${data.userId}`;
        if (typingTimeouts.current[key]) {
          clearTimeout(typingTimeouts.current[key]);
        }
        typingTimeouts. current[key] = setTimeout(() => {
          removeTypingUser(data.userId, data.groupId);
        }, 3000);
      } else {
        removeTypingUser(data.userId, data. groupId);
      }
    };

    const handleMessagesReadUpdate = (data: { messageIds: string[]; readBy: string }) => {
      if (data.readBy !== user?.id) {
        updateMessageStatus(data. messageIds, 'READ');
      }
    };

    on('message:new', handleNewMessage);
    on('typing:update', handleTypingUpdate);
    on('messages:read:update', handleMessagesReadUpdate);

    return () => {
      console.log('🔇 Removing chat event listeners');
      off('message:new', handleNewMessage);
      off('typing:update', handleTypingUpdate);
      off('messages:read:update', handleMessagesReadUpdate);
      listenersSetup.current = false;
    };
  }, [
    isConnected,
    user?. id,
    on,
    off,
    addMessage,
    incrementUnread,
    addTypingUser,
    removeTypingUser,
    updateMessageStatus,
  ]);

  /**
   * Auto-join groups when connected
   */
  useEffect(() => {
    if (! isConnected || groups.length === 0) {
      return;
    }

    const wasDisconnected = ! lastConnectionState.current;
    lastConnectionState.current = isConnected;

    if (wasDisconnected) {
      joinedGroups.current. clear();
    }

    const unjoinedGroups = groups.filter((group) => !joinedGroups.current.has(group. id));

    if (unjoinedGroups. length === 0) {
      return;
    }

    unjoinedGroups.forEach((group, index) => {
      setTimeout(() => {
        joinGroup(group.id);
      }, index * 200);
    });
  }, [isConnected, groups, joinGroup]);

  /**
   * Track connection state
   */
  useEffect(() => {
    lastConnectionState.current = isConnected;
  }, [isConnected]);

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      Object.values(typingTimeouts.current). forEach(clearTimeout);
      typingTimeouts. current = {};
    };
  }, []);

  return {
    groups,
    messages,
    activeGroupId,
    typingUsers,
    unreadCounts,
    isConnected,
    loadGroups,
    loadMessages,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendTyping,
    markAsRead,
    setActiveGroup,
  };
}