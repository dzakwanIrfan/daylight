import { Controller, Get, Query, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) { }

  /**
   * Get user's groups
   */
  @Get('groups')
  async getUserGroups(@CurrentUser() user: any) {
    return this.chatService.getUserGroups(user.id);
  }

  /**
   * Get messages for a group
   */
  @Get('groups/:groupId/messages')
  async getGroupMessages(
    @CurrentUser() user: any,
    @Param('groupId') groupId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const messages = await this.chatService.getGroupMessages(
      user.id,
      groupId,
      limit ? parseInt(limit, 10) : 50,
      before,
    );

    return {
      success: true,
      groupId,
      messages,
      count: messages.length,
    };
  }

  /**
   * Get unread message count
   */
  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser() user: any,
    @Query('groupId') groupId?: string,
  ) {
    const count = await this.chatService.getUnreadCount(user.id, groupId);
    return {
      success: true,
      count,
    };
  }

  /**
   * Mark messages as read (via REST)
   */
  @Patch('messages/read')
  async markMessagesAsRead(
    @CurrentUser() user: any,
    @Body() body: { messageIds: string[] },
  ) {
    const count = await this.chatService.markAsRead(body.messageIds, user.id);
    return {
      success: true,
      count,
    };
  }
}