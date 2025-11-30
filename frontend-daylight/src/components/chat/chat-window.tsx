'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useChatStore, type ChatGroup } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './chat-typing-indicator';
import { Loader2, Users, ArrowLeft, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  group: ChatGroup;
  onBack?: () => void;
  isMobile?: boolean;
}

export function ChatWindow({ group, onBack, isMobile = false }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { messages, typingUsers } = useChatStore();
  const { loadMessages, markAsRead, isConnected } = useChat();
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);
  const prevGroupId = useRef<string | null>(null);

  const groupMessages = messages[group.id] || [];
  const groupTypingUsers = typingUsers. filter((t) => t.groupId === group.id);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef. current) {
      messagesEndRef. current.scrollIntoView({ behavior });
    }
  }, []);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container. scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollButton(! isNearBottom);
  }, []);

  // Scroll to bottom when messages change (only if near bottom)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [groupMessages. length, scrollToBottom]);

  // Load messages on mount or group change
  useEffect(() => {
    if (prevGroupId.current === group.id && initialLoadDone.current) {
      return;
    }

    prevGroupId.current = group.id;
    initialLoadDone.current = true;
    setIsLoadingMessages(true);
    setHasMore(true);

    loadMessages(group.id)
      .then((msgs) => {
        if (msgs.length < 50) {
          setHasMore(false);
        }
        setTimeout(() => scrollToBottom('instant'), 100);
      })
      .finally(() => setIsLoadingMessages(false));
  }, [group.id, loadMessages, scrollToBottom]);

  // Mark as read when viewing
  useEffect(() => {
    if (! isConnected || !user || groupMessages.length === 0) return;

    const unreadMessages = groupMessages
      .filter((m) => m.senderId !== user.id && m.status !== 'READ')
      .map((m) => m.id);

    if (unreadMessages.length > 0) {
      const timeout = setTimeout(() => {
        markAsRead(group.id, unreadMessages);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [group.id, groupMessages, user, markAsRead, isConnected]);

  // Load older messages
  const loadOlderMessages = async () => {
    if (isLoadingMessages || !hasMore || groupMessages.length === 0) return;

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
  const groupedMessages = groupMessages. reduce(
    (acc, message) => {
      const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    },
    {} as Record<string, typeof groupMessages>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 p-2. 5 sm:p-3 md:p-4 bg-white z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back button for mobile */}
          {isMobile && onBack && (
            <button
              onClick={onBack}
              className="p-1. 5 sm:p-2 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-1">
              {group. event. title}
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              Group {group.groupNumber} • {group.members.length} members
            </p>
          </div>

          {/* Members toggle */}
          <button
            onClick={() => setShowMembers(! showMembers)}
            className={cn(
              'p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors',
              showMembers && 'bg-gray-100'
            )}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Members Panel */}
        {showMembers && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">Members</p>
            <div className="flex flex-wrap gap-1. 5 sm:gap-2">
              {group.members. map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-1. 5 sm:gap-2 bg-gray-50 rounded-full px-2 sm:px-3 py-0.5 sm:py-1"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand/10 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-brand">
                    {member.user.firstName?.[0] || member.user.email[0].toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm">
                    {member.user.firstName || member.user.email.split('@')[0]}
                    {member.userId === user?.id && ' (You)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2. 5 sm:p-3 md:p-4 space-y-2. 5 sm:space-y-3 md:space-y-4 bg-gray-50"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Load More Button */}
        {hasMore && groupMessages.length >= 50 && (
          <div className="text-center py-2">
            <button
              onClick={loadOlderMessages}
              disabled={isLoadingMessages}
              className="text-xs sm:text-sm text-brand hover:underline disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoadingMessages ?  (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  Loading... 
                </>
              ) : (
                'Load older messages'
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingMessages && groupMessages.length === 0 && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-brand" />
          </div>
        )}

        {/* Empty State */}
        {! isLoadingMessages && groupMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand/10 flex items-center justify-center mb-3 sm:mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-brand" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">No messages yet</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Be the first to say hello!</p>
          </div>
        )}

        {/* Messages Grouped by Date */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-2 sm:space-y-3">
            {/* Date Separator */}
            <div className="flex items-center justify-center sticky top-0 z-10 py-1 sm:py-2">
              <div className="bg-gray-200/90 backdrop-blur-sm text-gray-600 text-[10px] sm:text-xs px-2. 5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {format(new Date(date), 'MMMM d, yyyy')}
              </div>
            </div>

            {/* Messages */}
            {msgs.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
                group={group}
              />
            ))}
          </div>
        ))}

        {/* Typing Indicator */}
        {groupTypingUsers.length > 0 && (
          <TypingIndicator users={groupTypingUsers} group={group} />
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-colors z-20"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Input */}
      <div className="shrink-0">
        <ChatInput groupId={group.id} />
      </div>
    </div>
  );
}