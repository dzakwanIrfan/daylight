'use client';

import { useChatStore, type ChatGroup } from '@/store/chat-store';
import { formatDistanceToNow } from 'date-fns';
import { Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatGroupListProps {
  groups: ChatGroup[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
}

export function ChatGroupList({ groups, activeGroupId, onSelectGroup }: ChatGroupListProps) {
  const { unreadCounts, messages } = useChatStore();

  const getLastMessage = (group: ChatGroup) => {
    const groupMessages = messages[group.id] || [];
    return groupMessages[groupMessages.length - 1] || group.messages?.[0];
  };

  if (groups.length === 0) {
    return (
      <div className="p-6 text-center">
        <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No chat groups</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {groups.map((group) => {
        const lastMessage = getLastMessage(group);
        const unread = unreadCounts[group.id] || 0;
        const isActive = activeGroupId === group.id;

        return (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={cn(
              'w-full p-4 text-left hover:bg-gray-50 transition-colors',
              isActive && 'bg-brand/5 border-l-4 border-brand',
              !isActive && 'border-l-4 border-transparent'
            )}
          >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={cn(
                      'font-semibold text-sm md:text-base line-clamp-1',
                      unread > 0 && 'text-brand'
                    )}
                  >
                    {group.event.title}
                  </h3>
                  {unread > 0 && (
                    <span className="shrink-0 bg-brand text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 font-medium">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>

                {/* Group Info */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{group.members.length} members</span>
                </div>

                {/* Last Message */}
                {lastMessage && (
                  <div className="mt-1.5">
                    <p
                      className={cn(
                        'text-sm line-clamp-2 wrap-break-word',
                        unread > 0 ? 'font-medium text-gray-900' : 'text-muted-foreground'
                      )}
                    >
                      <span className="font-medium">
                        {lastMessage.sender?.firstName || 'Someone'}:
                      </span>{' '}
                      {lastMessage.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
          </button>
        );
      })}
    </div>
  );
}