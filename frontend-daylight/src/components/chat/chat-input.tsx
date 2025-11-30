'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  groupId: string;
}

export function ChatInput({ groupId }: ChatInputProps) {
  const { sendMessage, sendTyping, isConnected } = useChat(); // ✅ Get isConnected from useChat
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!isConnected) return;

    // Send typing start
    if (!isTypingRef.current && value.length > 0) {
      sendTyping(groupId, true);
      isTypingRef.current = true;
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef. current);
    }

    // Send typing stop after 1 second of inactivity
    typingTimeoutRef. current = setTimeout(() => {
      if (isTypingRef.current) {
        sendTyping(groupId, false);
        isTypingRef.current = false;
      }
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) return;

    if (!isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

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
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef. current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast. error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e. key === 'Enter' && ! e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
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
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            handleTyping(e. target.value);
            handleInput(e);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ?  'Type a message...' : 'Connecting to chat server... '}
          disabled={!isConnected || isSending}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed min-h-11 max-h-32"
          rows={1}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending || !isConnected}
          className="bg-brand text-white p-3 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-11 w-11 flex items-center justify-center"
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