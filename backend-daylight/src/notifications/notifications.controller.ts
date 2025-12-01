import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Get user notifications
   */
  @Get()
  async getUserNotifications(
    @CurrentUser() user: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    const notifications = await this. notificationsService.getUserNotifications(
      user.id,
      unreadOnly === 'true',
      limit ? parseInt(limit, 10) : 50,
    );

    return {
      success: true,
      notifications,
      count: notifications.length,
    };
  }

  /**
   * Get unread count
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this. notificationsService.getUnreadCount(user.id);
    return {
      success: true,
      count,
    };
  }

  /**
   * Mark notification as read
   */
  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    const success = await this.notificationsService.markAsRead(id, user.id);
    return {
      success,
      message: success ? 'Notification marked as read' : 'Notification not found',
    };
  }

  /**
   * Mark all as read
   */
  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    const count = await this.notificationsService.markAllAsRead(user. id);
    return {
      success: true,
      count,
      message: `${count} notifications marked as read`,
    };
  }

  /**
   * Delete notification
   */
  @Delete(':id')
  async deleteNotification(@CurrentUser() user: any, @Param('id') id: string) {
    const success = await this.notificationsService.deleteNotification(id, user.id);
    return {
      success,
      message: success ? 'Notification deleted' : 'Notification not found',
    };
  }
}