'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { useChatStore } from '@/store/chat-store';
import { DashboardLayout } from '@/components/main/dashboard-layout';
import { MessageCircle, Users, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { ChatGroupList } from '@/components/chat/chat-group-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';
import { cn } from '@/lib/utils';

function ChatPageContent() {
  useAuth();
  const searchParams = useSearchParams();
  const { groups, isConnected, loadGroups } = useChat();
  const { activeGroupId, setActiveGroup } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  // Load groups on mount
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
  }, []);

  // Handle URL group parameter
  useEffect(() => {
    const groupParam = searchParams.get('group');
    if (groupParam && groups.length > 0) {
      const groupExists = groups.some((g) => g.id === groupParam);
      if (groupExists) {
        setActiveGroup(groupParam);
        setShowChatOnMobile(true);
      }
    }
  }, [searchParams, groups, setActiveGroup]);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const handleSelectGroup = useCallback(
    (groupId: string) => {
      setActiveGroup(groupId);
      setShowChatOnMobile(true);
      window.history.replaceState(null, '', `/chat?group=${groupId}`);
    },
    [setActiveGroup]
  );

  const handleBackToList = useCallback(() => {
    setShowChatOnMobile(false);
    setActiveGroup(null);
    window.history.replaceState(null, '', '/chat');
  }, [setActiveGroup]);

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
      <div className="flex flex-col h-screen md:h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="shrink-0 px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-brand" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl lg:text-2xl font-bold truncate">Chat</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Connect with your group members
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {isConnected ? (
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                  <span className="hidden sm:inline">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-orange-600">
                  <WifiOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Connecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-4">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
              <p className="text-sm text-muted-foreground">Loading your chats...</p>
            </div>
          ) : loadError ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
              <WifiOff className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-muted-foreground text-center">
                Failed to load chat groups
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          ) : groups.length === 0 ? (
            <div className="h-full overflow-y-auto">
              <ChatEmptyState />
            </div>
          ) : (
            <div className="h-full bg-white">
              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 h-full">
                {/* Group List */}
                <div className="md:col-span-1 border-r border-gray-200 flex flex-col h-full overflow-hidden">
                  <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                    <h2 className="font-semibold text-sm text-muted-foreground">
                      Your Groups ({groups.length})
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ChatGroupList
                      groups={groups}
                      activeGroupId={activeGroupId}
                      onSelectGroup={handleSelectGroup}
                    />
                  </div>
                </div>

                {/* Chat Window */}
                <div className="md:col-span-2 lg:col-span-3 h-full overflow-hidden">
                  {activeGroup ? (
                    <ChatWindow group={activeGroup} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-6 bg-gray-50">
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground">Select a group to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden h-full overflow-hidden">
                {showChatOnMobile && activeGroup ? (
                  <ChatWindow group={activeGroup} onBack={handleBackToList} isMobile={true} />
                ) : (
                  <div className="h-full flex flex-col overflow-hidden">
                    <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3">
                      <h2 className="font-semibold text-sm text-muted-foreground">
                        Your Groups ({groups.length})
                      </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <ChatGroupList
                        groups={groups}
                        activeGroupId={activeGroupId}
                        onSelectGroup={handleSelectGroup}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        </DashboardLayout>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}