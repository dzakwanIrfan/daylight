'use client';

import { type Message, type ChatGroup } from '@/store/chat-store';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  group: ChatGroup;
}

export function ChatMessage({ message, isOwn, group }: ChatMessageProps) {
  const sender = group.members.find((m) => m.userId === message.senderId)?.user;

  const getStatusIcon = () => {
    if (! isOwn) return null;

    switch (message.status) {
      case 'SENT':
        return <Check className="w-3 h-3" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3 h-3" />;
      case 'READ':
        return <CheckCheck className="w-3 h-3 text-brand" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex gap-1. 5 sm:gap-2', isOwn && 'flex-row-reverse')}>
      {/* Avatar */}
      {! isOwn && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand/10 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-brand shrink-0">
          {sender?.firstName?.[0] || sender?.email[0].toUpperCase()}
        </div>
      )}

      <div className={cn('flex flex-col gap-0.5 sm:gap-1 max-w-[75%] sm:max-w-[70%]', isOwn && 'items-end')}>
        {/* Sender Name (only for others) */}
        {!isOwn && (
          <span className="text-[10px] sm:text-xs text-muted-foreground px-2 sm:px-3">
            {sender?. firstName || sender?.email?. split('@')[0]}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 wrap-break-word',
            isOwn
              ? 'bg-brand text-white rounded-tr-sm sm:rounded-tr-none'
              : 'bg-white border border-gray-200 rounded-tl-sm sm:rounded-tl-none'
          )}
        >
          <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Time & Status */}
        <div className={cn('flex items-center gap-1 px-2 sm:px-3', isOwn && 'flex-row-reverse')}>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}