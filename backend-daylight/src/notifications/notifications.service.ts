import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a notification
   */
  async createNotification(data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        metadata: data.metadata || {},
      },
    });

    this.logger.log(`Notification created: ${notification.id} for user ${data.userId}`);
    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>) {
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        referenceId: data.referenceId,
        referenceType: data. referenceType,
        metadata: data.metadata || {},
      })),
    });

    this. logger.log(`${notifications.count} notifications created`);
    return notifications;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, unreadOnly = false, limit = 50) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return notification.count > 0;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
    return result.count;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const result = await this.prisma. notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return result.count > 0;
  }
}