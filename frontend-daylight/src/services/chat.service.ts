import apiClient from '@/lib/axios';
import type { ChatGroup, Message } from '@/store/chat-store';

export interface SendMessageDto {
  content: string;
  groupId: string;
}

export interface GetMessagesParams {
  limit?: number;
  before?: string;
}

export const chatService = {
  /**
   * Get user's chat groups
   */
  getUserGroups: async (): Promise<ChatGroup[]> => {
    const response = await apiClient.get('/chat/groups');
    return response. data;
  },

  /**
   * Get messages for a specific group
   */
  getGroupMessages: async (
    groupId: string,
    params?: GetMessagesParams
  ): Promise<{ messages: Message[]; count: number }> => {
    const response = await apiClient.get(`/chat/groups/${groupId}/messages`, { params });
    return response.data;
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (groupId?: string): Promise<{ count: number }> => {
    const response = await apiClient. get('/chat/unread-count', {
      params: groupId ? { groupId } : {},
    });
    return response. data;
  },

  /**
   * Mark messages as read (REST fallback)
   */
  markMessagesAsRead: async (messageIds: string[]): Promise<{ count: number }> => {
    const response = await apiClient. patch('/chat/messages/read', { messageIds });
    return response. data;
  },
};