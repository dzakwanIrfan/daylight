export interface SendMessageDto {
  content: string;
  groupId: string;
}

export interface TypingDto {
  groupId: string;
  isTyping: boolean;
}

export interface MessageAck {
  success: boolean;
  message?: any;
  error?: string;
  timestamp: Date;
}

export interface JoinGroupDto {
  groupId: string;
}

export interface MarkMessagesDto {
  messageIds: string[];
  groupId: string;
}