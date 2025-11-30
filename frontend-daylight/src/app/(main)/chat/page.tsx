'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { useChatStore } from '@/store/chat-store';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { MessageCircle, Users, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { ChatGroupList } from '@/components/chat/chat-group-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';

export default function ChatPage() {
  useAuth();
  const { groups, isConnected, loadGroups } = useChat();
  const { activeGroupId, setActiveGroup } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Load groups ONCE on mount
  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError(false);

    loadGroups()
      .then(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
          setLoadError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - only run once

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(false);
    loadGroups()
      .then(() => setIsLoading(false))
      .catch(() => {
        setIsLoading(false);
        setLoadError(true);
      });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Chat</h1>
                <p className="text-sm text-muted-foreground">
                  Connect with your group members
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <WifiOff className="w-4 h-4" />
                  Connecting...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <p className="text-muted-foreground">Loading your chats...</p>
          </div>
        ) : loadError ?  (
          <div className="bg-white rounded-lg border border-gray-200 p-12 flex flex-col items-center justify-center gap-4">
            <WifiOff className="w-12 h-12 text-gray-400" />
            <p className="text-muted-foreground">Failed to load chat groups</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : groups.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-300px)] min-h-[500px]">
              {/* Group List */}
              <div className="border-r border-gray-200 overflow-y-auto">
                <ChatGroupList
                  groups={groups}
                  activeGroupId={activeGroupId}
                  onSelectGroup={setActiveGroup}
                />
              </div>

              {/* Chat Window */}
              <div className="col-span-2">
                {activeGroup ? (
                  <ChatWindow group={activeGroup} />
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div className="space-y-3">
                      <Users className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-muted-foreground">
                        Select a group to start chatting
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}