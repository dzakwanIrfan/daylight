import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  senderId: string;
  groupId: string;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    profilePicture: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatGroup {
  id: string;
  groupNumber: number;
  eventId: string;
  event: {
    id: string;
    title: string;
    eventDate: string;
  };
  members: Array<{
    userId: string;
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      profilePicture: string | null;
    };
  }>;
  messages: Message[];
  unreadCount?: number;
  lastMessage?: Message;
}

export interface TypingUser {
  userId: string;
  groupId: string;
  timestamp: Date;
}

interface ChatState {
  groups: ChatGroup[];
  messages: Record<string, Message[]>; // groupId -> messages
  activeGroupId: string | null;
  typingUsers: TypingUser[];
  unreadCounts: Record<string, number>; // groupId -> count
  isLoading: boolean;
  hasLoaded: boolean;

  // Actions
  setGroups: (groups: ChatGroup[]) => void;
  setActiveGroup: (groupId: string | null) => void;
  addMessage: (groupId: string, message: Message) => void;
  setMessages: (groupId: string, messages: Message[]) => void;
  prependMessages: (groupId: string, messages: Message[]) => void;
  updateMessageStatus: (messageIds: string[], status: Message['status']) => void;
  addTypingUser: (typing: TypingUser) => void;
  removeTypingUser: (userId: string, groupId: string) => void;
  clearTypingUsers: (groupId: string) => void;
  incrementUnread: (groupId: string) => void;
  clearUnread: (groupId: string) => void;
  setUnreadCount: (groupId: string, count: number) => void;
  setLoading: (loading: boolean) => void;
  setHasLoaded: (loaded: boolean) => void;
  reset: () => void;
}

const initialState = {
  groups: [],
  messages: {},
  activeGroupId: null,
  typingUsers: [],
  unreadCounts: {},
  isLoading: false,
  hasLoaded: false,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setGroups: (groups) => set({ groups, hasLoaded: true }),

      setActiveGroup: (groupId) => set({ activeGroupId: groupId }),

      addMessage: (groupId, message) =>
        set((state) => {
          const groupMessages = state.messages[groupId] || [];

          // Prevent duplicates
          if (groupMessages.some((m) => m.id === message. id)) {
            return state;
          }

          return {
            messages: {
              ...state.messages,
              [groupId]: [... groupMessages, message],
            },
          };
        }),

      setMessages: (groupId, messages) =>
        set((state) => ({
          messages: {
            ...state. messages,
            [groupId]: messages,
          },
        })),

      prependMessages: (groupId, messages) =>
        set((state) => {
          const existing = state.messages[groupId] || [];
          const existingIds = new Set(existing.map((m) => m. id));
          const newMessages = messages.filter((m) => !existingIds.has(m.id));

          return {
            messages: {
              ...state.messages,
              [groupId]: [...newMessages, ...existing],
            },
          };
        }),

      updateMessageStatus: (messageIds, status) =>
        set((state) => {
          const updatedMessages = { ...state.messages };
          const messageIdSet = new Set(messageIds);

          Object.keys(updatedMessages).forEach((groupId) => {
            updatedMessages[groupId] = updatedMessages[groupId].map((msg) =>
              messageIdSet.has(msg.id) ?  { ...msg, status } : msg
            );
          });

          return { messages: updatedMessages };
        }),

      addTypingUser: (typing) =>
        set((state) => {
          const filtered = state.typingUsers.filter(
            (t) => !(t.userId === typing.userId && t.groupId === typing.groupId)
          );
          return {
            typingUsers: [... filtered, typing],
          };
        }),

      removeTypingUser: (userId, groupId) =>
        set((state) => ({
          typingUsers: state.typingUsers.filter(
            (t) => !(t.userId === userId && t.groupId === groupId)
          ),
        })),

      clearTypingUsers: (groupId) =>
        set((state) => ({
          typingUsers: state.typingUsers. filter((t) => t.groupId !== groupId),
        })),

      incrementUnread: (groupId) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [groupId]: (state.unreadCounts[groupId] || 0) + 1,
          },
        })),

      clearUnread: (groupId) =>
        set((state) => ({
          unreadCounts: {
            ... state.unreadCounts,
            [groupId]: 0,
          },
        })),

      setUnreadCount: (groupId, count) =>
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [groupId]: count,
          },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setHasLoaded: (hasLoaded) => set({ hasLoaded }),

      reset: () => set(initialState),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal data
        unreadCounts: state.unreadCounts,
        activeGroupId: state. activeGroupId,
      }),
    }
  )
);