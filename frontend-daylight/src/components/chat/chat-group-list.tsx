'use client';

import { useChatStore, type ChatGroup } from '@/store/chat-store';
import { formatDistanceToNow } from 'date-fns';
import { Users, Calendar } from 'lucide-react';
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
    return groupMessages[groupMessages.length - 1];
  };

  return (
    <div className="divide-y divide-gray-200">
      {groups.map((group) => {
        const lastMessage = getLastMessage(group);
        const unread = unreadCounts[group. id] || 0;
        const isActive = activeGroupId === group. id;

        return (
          <button
            key={group. id}
            onClick={() => onSelectGroup(group.id)}
            className={cn(
              'w-full p-4 text-left hover:bg-gray-50 transition-colors',
              isActive && 'bg-brand/5 border-l-4 border-brand'
            )}
          >
            <div className="space-y-2">
              {/* Event Title */}
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  'font-semibold text-sm line-clamp-1',
                  unread > 0 && 'text-brand'
                )}>
                  {group.event.title}
                </h3>
                {unread > 0 && (
                  <span className="bg-brand text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                    {unread}
                  </span>
                )}
              </div>

              {/* Group Info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{group.members.length} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Group {group.groupNumber}</span>
                </div>
              </div>

              {/* Last Message */}
              {lastMessage && (
                <div className="space-y-1">
                  <p className={cn(
                    'text-xs line-clamp-1',
                    unread > 0 ?  'font-medium text-gray-900' : 'text-muted-foreground'
                  )}>
                    {lastMessage.sender.firstName}: {lastMessage.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
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