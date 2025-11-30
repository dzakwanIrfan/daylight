'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useChatStore, type ChatGroup } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './chat-typing-indicator';
import { Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  group: ChatGroup;
}

export function ChatWindow({ group }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { messages, typingUsers } = useChatStore();
  const { loadMessages, markAsRead } = useChat();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const groupMessages = messages[group.id] || [];
  const groupTypingUsers = typingUsers. filter((t) => t.groupId === group.id);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?. scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages. length]);

  // Mark as read when viewing
  useEffect(() => {
    if (groupMessages.length > 0 && user) {
      const unreadMessages = groupMessages
        .filter((m) => m.senderId !== user.id && m.status !== 'READ')
        .map((m) => m.id);

      if (unreadMessages.length > 0) {
        setTimeout(() => {
          markAsRead(group.id, unreadMessages);
        }, 1000);
      }
    }
  }, [group.id, groupMessages, user, markAsRead]);

  // Load older messages
  const loadOlderMessages = async () => {
    if (isLoadingMessages || !hasMore) return;

    setIsLoadingMessages(true);
    const oldestMessage = groupMessages[0];
    const before = oldestMessage?. createdAt;

    const olderMessages = await loadMessages(group.id, before);

    if (olderMessages.length < 50) {
      setHasMore(false);
    }

    setIsLoadingMessages(false);
  };

  // Group messages by date
  const groupedMessages = groupMessages.reduce((acc, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, typeof groupMessages>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg line-clamp-1">{group.event.title}</h2>
            <p className="text-sm text-muted-foreground">
              Group {group.groupNumber} • {group.members.length} members
            </p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {/* Load More Button */}
        {hasMore && groupMessages.length >= 50 && (
          <div className="text-center">
            <button
              onClick={loadOlderMessages}
              disabled={isLoadingMessages}
              className="text-sm text-brand hover:underline disabled:opacity-50"
            >
              {isLoadingMessages ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                'Load older messages'
              )}
            </button>
          </div>
        )}

        {/* Messages Grouped by Date */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-3">
            {/* Date Separator */}
            <div className="flex items-center justify-center">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                {format(new Date(date), 'MMMM d, yyyy')}
              </div>
            </div>

            {/* Messages */}
            {msgs.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === user?. id}
                group={group}
              />
            ))}
          </div>
        ))}

        {/* Typing Indicator */}
        {groupTypingUsers.length > 0 && (
          <TypingIndicator users={groupTypingUsers} group={group} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput groupId={group.id} />
    </div>
  );
}