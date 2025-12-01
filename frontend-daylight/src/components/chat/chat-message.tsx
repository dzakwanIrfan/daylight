'use client';

import { type Message, type ChatGroup } from '@/store/chat-store';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  group: ChatGroup;
}

export function ChatMessage({ message, isOwn, group }: ChatMessageProps) {
  const sender = group.members.find((m) => m.userId === message.senderId)?.user;

  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case 'SENT':
        return <Check className="w-3 h-3 shrink-0" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3 h-3 shrink-0" />;
      case 'READ':
        return <CheckCheck className="w-3 h-3 text-brand shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex gap-2 w-full', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar - hanya untuk pesan orang lain */}
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={sender?.profilePicture || undefined} 
            alt={sender?.email} 
            crossOrigin='anonymous'
            referrerPolicy='no-referrer'
          />
          <AvatarFallback className="bg-brand/10 text-brand text-sm font-medium">
            {`${sender?.firstName?.[0] || ''}${sender?.lastName?.[0] || ''}`.toUpperCase() || sender?.email?.[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Container */}
      <div className={cn('flex flex-col gap-1 max-w-[75%] sm:max-w-[70%] md:max-w-[65%]', isOwn && 'items-end')}>
        {/* Sender Name - hanya untuk pesan orang lain */}
        {!isOwn && (
          <span className="text-xs text-muted-foreground truncate max-w-full">
            {sender?.firstName || sender?.email?.split('@')[0]}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-3 py-2 md:px-4 md:py-2.5',
            'wrap-break-word overflow-hidden hyphens-auto',
            isOwn
              ? 'bg-brand text-white rounded-tr-sm'
              : 'bg-white border border-gray-200 rounded-tl-sm'
          )}
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            wordWrap: 'break-word'
          }}
        >
          <p 
            className="text-sm md:text-base whitespace-pre-wrap"
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {message.content}
          </p>
        </div>

        {/* Time & Status */}
        <div className={cn('flex items-center gap-1 px-3', isOwn && 'flex-row-reverse')}>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}