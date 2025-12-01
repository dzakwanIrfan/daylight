import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageStatus } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Sanitize message content to prevent XSS
   */
  private sanitizeContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: [], // No HTML tags allowed (text-only)
      allowedAttributes: {},
      disallowedTagsMode: 'escape',
    }). trim();
  }

  /**
   * Verify user is member of the group
   */
  async verifyGroupMembership(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.prisma.matchingMember.findFirst({
      where: {
        userId,
        groupId,
      },
    });

    return !!membership;
  }

  /**
   * Send a message to a group
   */
  async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
    const { content, groupId } = sendMessageDto;

    // Verify group exists
    const group = await this. prisma.matchingGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Verify user is a member
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Sanitize content
    const sanitizedContent = this.sanitizeContent(content);

    if (! sanitizedContent) {
      throw new ForbiddenException('Message content cannot be empty');
    }

    // Create message
    const message = await this.prisma.message. create({
      data: {
        content: sanitizedContent,
        senderId: userId,
        groupId,
        status: MessageStatus. SENT,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    this.logger.log(`Message sent: ${message.id} by user ${userId} in group ${groupId}`);
    return message;
  }

  /**
   * Get messages for a group with pagination
   */
  async getGroupMessages(userId: string, groupId: string, limit = 50, before?: string) {
    // Verify membership
    const isMember = await this.verifyGroupMembership(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const messages = await this.prisma. message.findMany({
      where: {
        groupId,
        ...(before && {
          createdAt: {
            lt: new Date(before),
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return messages. reverse(); // Oldest first
  }

  /**
   * Mark messages as delivered
   */
  async markAsDelivered(messageIds: string[], userId: string) {
    const updated = await this.prisma.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
        senderId: {
          not: userId, // Don't update own messages
        },
        status: MessageStatus.SENT,
      },
      data: {
        status: MessageStatus. DELIVERED,
      },
    });

    this.logger.log(`Marked ${updated.count} messages as delivered for user ${userId}`);
    return updated. count;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(messageIds: string[], userId: string) {
    const updated = await this.prisma.message. updateMany({
      where: {
        id: {
          in: messageIds,
        },
        senderId: {
          not: userId,
        },
        status: {
          in: [MessageStatus.SENT, MessageStatus.DELIVERED],
        },
      },
      data: {
        status: MessageStatus. READ,
      },
    });

    this.logger.log(`Marked ${updated.count} messages as read for user ${userId}`);
    return updated.count;
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string, groupId?: string) {
    const count = await this.prisma.message. count({
      where: {
        group: {
          members: {
            some: {
              userId,
            },
          },
        },
        senderId: {
          not: userId,
        },
        status: {
          not: MessageStatus. READ,
        },
        ...(groupId && { groupId }),
      },
    });

    return count;
  }

  /**
   * Get user's groups with last message
   */
  async getUserGroups(userId: string) {
    const groups = await this.prisma.matchingGroup.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return groups;
  }
}