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
  } = useChatStore();

  const { socket, isConnected, emit, on, off } = useSocket({
    namespace: '/chat',
    autoConnect: true,
  });

  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const joinedGroups = useRef<Set<string>>(new Set());
  const hasLoadedGroups = useRef(false);

  /**
   * Load user groups - STABLE FUNCTION
   */
  const loadGroups = useCallback(async () => {
    if (hasLoadedGroups.current) {
      console.log('⚠️ Groups already loaded, skipping.. .');
      return groups; // Return existing groups
    }

    try {
      console.log('📡 Loading user groups...');
      const userGroups = await chatService.getUserGroups();
      setGroups(userGroups);
      hasLoadedGroups.current = true;
      console.log(`✅ Loaded ${userGroups.length} groups`);
      return userGroups;
    } catch (error) {
      console.error('❌ Failed to load groups:', error);
      toast.error('Failed to load chat groups');
      return [];
    }
  }, [setGroups, groups]);

  /**
   * Load messages for a group - STABLE FUNCTION
   */
  const loadMessages = useCallback(
    async (groupId: string, before?: string) => {
      try {
        console.log(`📡 Loading messages for group: ${groupId}`);
        const { messages: groupMessages } = await chatService.getGroupMessages(groupId, {
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
   * Join a group room - STABLE FUNCTION
   */
  const joinGroup = useCallback(
    (groupId: string) => {
      if (!isConnected || !socket) {
        console.warn('⚠️ Cannot join group: Socket not connected');
        return;
      }

      if (joinedGroups.current. has(groupId)) {
        console.log(`⚠️ Already joined group: ${groupId}`);
        return;
      }

      console.log('🔗 Joining group:', groupId);

      emit('join:group', { groupId }, (response: any) => {
        if (response?. success) {
          console.log('✅ Joined group:', groupId);
          joinedGroups.current.add(groupId);
          loadMessages(groupId);
        } else {
          console.error('❌ Failed to join group:', response);
          toast.error('Failed to join chat group');
        }
      });
    },
    [isConnected, socket, emit, loadMessages]
  );

  /**
   * Leave a group room - STABLE FUNCTION
   */
  const leaveGroup = useCallback(
    (groupId: string) => {
      if (!isConnected || ! socket || !joinedGroups.current.has(groupId)) {
        return;
      }

      console. log('🚪 Leaving group:', groupId);
      emit('leave:group', { groupId });
      joinedGroups.current.delete(groupId);
    },
    [isConnected, socket, emit]
  );

  /**
   * Send a message - STABLE FUNCTION
   */
  const sendMessage = useCallback(
    async (groupId: string, content: string) => {
      if (!isConnected || !socket) {
        toast.error('Not connected to chat server');
        return null;
      }

      if (!content.trim()) {
        return null;
      }

      console.log('📤 Sending message to group:', groupId);

      return new Promise<Message | null>((resolve) => {
        emit(
          'message:send',
          { content: content.trim(), groupId },
          (ack: { success: boolean; message?: Message; error?: string }) => {
            console.log('📥 Send message ACK:', ack);

            if (ack.success && ack.message) {
              resolve(ack.message);
            } else {
              toast.error(ack.error || 'Failed to send message');
              resolve(null);
            }
          }
        );
      });
    },
    [isConnected, socket, emit]
  );

  /**
   * Send typing indicator - STABLE FUNCTION
   */
  const sendTyping = useCallback(
    (groupId: string, isTyping: boolean) => {
      if (!isConnected || !socket) return;
      emit('typing', { groupId, isTyping });
    },
    [isConnected, socket, emit]
  );

  /**
   * Mark messages as read - STABLE FUNCTION
   */
  const markAsRead = useCallback(
    (groupId: string, messageIds: string[]) => {
      if (!isConnected || !socket || messageIds.length === 0) return;

      emit('messages:read', { messageIds, groupId });
      clearUnread(groupId);
    },
    [isConnected, socket, emit, clearUnread]
  );

  /**
   * Socket event listeners - ONLY SETUP ONCE
   */
  useEffect(() => {
    if (! isConnected || !socket) return;

    console.log('🎧 Setting up socket event listeners');

    const handleNewMessage = (message: Message) => {
      console.log('📨 New message received:', message);
      addMessage(message. groupId, message);

      if (message.senderId !== user?.id) {
        if (activeGroupId !== message.groupId) {
          incrementUnread(message.groupId);
        } else {
          setTimeout(() => {
            markAsRead(message.groupId, [message.id]);
          }, 500);
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
          groupId: data.groupId,
          timestamp: new Date(data.timestamp),
        });

        const key = `${data.groupId}-${data.userId}`;
        if (typingTimeouts.current[key]) {
          clearTimeout(typingTimeouts.current[key]);
        }
        typingTimeouts.current[key] = setTimeout(() => {
          removeTypingUser(data.userId, data.groupId);
        }, 3000);
      } else {
        removeTypingUser(data. userId, data.groupId);
      }
    };

    const handleMessagesReadUpdate = (data: {
      messageIds: string[];
      readBy: string;
    }) => {
      if (data.readBy !== user?.id) {
        updateMessageStatus(data.messageIds, 'READ');
      }
    };

    on('message:new', handleNewMessage);
    on('typing:update', handleTypingUpdate);
    on('messages:read:update', handleMessagesReadUpdate);

    return () => {
      console.log('🔇 Removing socket event listeners');
      off('message:new', handleNewMessage);
      off('typing:update', handleTypingUpdate);
      off('messages:read:update', handleMessagesReadUpdate);
    };
  }, [isConnected, socket, user?.id, activeGroupId, on, off, addMessage, incrementUnread, addTypingUser, removeTypingUser, updateMessageStatus, markAsRead]);

  /**
   * Auto-join groups when connected - WITH GUARD
   */
  useEffect(() => {
    if (!isConnected || !socket || groups.length === 0) {
      return;
    }

    console.log('🚪 Auto-joining groups:', groups. length);

    // Only join groups that haven't been joined
    const unjoinedGroups = groups.filter((group) => !joinedGroups.current.has(group. id));

    if (unjoinedGroups.length === 0) {
      console. log('✅ All groups already joined');
      return;
    }

    console.log(`🔗 Joining ${unjoinedGroups.length} unjoined groups... `);

    unjoinedGroups.forEach((group, index) => {
      setTimeout(() => {
        joinGroup(group.id);
      }, index * 200); // Stagger joins
    });
  }, [isConnected, socket, groups, joinGroup]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console. log('🧹 Cleaning up useChat.. .');
      Object.values(typingTimeouts. current).forEach(clearTimeout);
      typingTimeouts.current = {};
      joinedGroups.current.clear();
      hasLoadedGroups. current = false;
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
  };
}