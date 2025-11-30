'use client';

import { type TypingUser, type ChatGroup } from '@/store/chat-store';

interface TypingIndicatorProps {
  users: TypingUser[];
  group: ChatGroup;
}

export function TypingIndicator({ users, group }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const typingNames = users
    .map((t) => {
      const member = group.members.find((m) => m.userId === t. userId);
      return member?.user. firstName || member?.user.email. split('@')[0] || 'Someone';
    })
    .slice(0, 3);

  const text =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : typingNames.length === 2
      ? `${typingNames[0]} and ${typingNames[1]} are typing`
      : `${typingNames[0]}, ${typingNames[1]} and ${users.length - 2} others are typing`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground px-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}...</span>
    </div>
  );
}