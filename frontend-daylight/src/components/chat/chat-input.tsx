'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  groupId: string;
}

export function ChatInput({ groupId }: ChatInputProps) {
  const { sendMessage, sendTyping, isConnected } = useChat();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTyping = useCallback(
    (value: string) => {
      setMessage(value);

      if (!isConnected) return;

      // Send typing start
      if (!isTypingRef.current && value.length > 0) {
        sendTyping(groupId, true);
        isTypingRef.current = true;
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing stop after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          sendTyping(groupId, false);
          isTypingRef.current = false;
        }
      }, 1000);
    },
    [isConnected, groupId, sendTyping]
  );

  const resetTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending || !isConnected) return;

    setIsSending(true);

    // Stop typing indicator
    if (isTypingRef.current) {
      sendTyping(groupId, false);
      isTypingRef.current = false;
    }

    try {
      const sent = await sendMessage(groupId, trimmedMessage);

      if (sent) {
        setMessage('');
        resetTextarea();
      }
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        sendTyping(groupId, false);
      }
    };
  }, [groupId, sendTyping]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 md:p-4 bg-white">
      <div className="flex items-end gap-2 md:gap-3">
        <div className="flex-1 min-w-0 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              handleTyping(e.target.value);
              handleInput(e);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!isConnected || isSending}
            className={cn(
              'w-full resize-none border border-gray-300 rounded-2xl px-4 py-2.5',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'text-sm md:text-base',
              'min-h-11 max-h-[120px]'
            )}
            rows={1}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending || !isConnected}
          className={cn(
            'shrink-0 bg-brand text-white rounded-full transition-all',
            'hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed',
            'w-11 h-11 flex items-center justify-center'
          )}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}