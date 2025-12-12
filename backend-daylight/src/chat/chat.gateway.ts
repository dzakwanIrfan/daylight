import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsJwtAuthGuard } from '../common/guards/ws-jwt-auth.guard';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/send-message.dto';
import { TypingDto } from './dto/typing.dto';
import { MessageAckDto } from './dto/message-ack.dto';
import { NotificationType } from '@prisma/client';

interface RateLimitData {
  count: number;
  resetTime: number;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly rateLimitMap = new Map<string, RateLimitData>();
  private readonly RATE_LIMIT_MAX = 10; // messages
  private readonly RATE_LIMIT_WINDOW = 10000; // 10 seconds

  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    this.logger.log(`WebSocket Gateway initialized`);
    this.logger.log(`Accepting connections from: ${frontendUrl}`);
  }

  @UseGuards(WsJwtAuthGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.userId;
    console.log(`Client attempting to connect: ${client.id} (User: ${userId || 'unknown'})`);
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Auth will be handled by guard on message events
      client.emit('connected', {
        message: 'Connected to chat server',
        socketId: client.id,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.userId;
    this.logger.log(
      `Client disconnected: ${client.id} (User: ${userId || 'unknown'})`,
    );

    // Clean up rate limit data
    if (userId) {
      this.rateLimitMap.delete(userId);
    }
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userData = this.rateLimitMap.get(userId);

    if (!userData || now > userData.resetTime) {
      // Reset rate limit
      this.rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
      return true;
    }

    if (userData.count >= this.RATE_LIMIT_MAX) {
      return false;
    }

    userData.count++;
    return true;
  }

  /**
   * Join a group room
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join:group')
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    try {
      const userId = client.data.user.userId;
      const { groupId } = data;

      // Verify membership
      const isMember = await this.chatService.verifyGroupMembership(
        userId,
        groupId,
      );
      if (!isMember) {
        throw new WsException('Not a member of this group');
      }

      // Join socket room
      await client.join(`group:${groupId}`);

      this.logger.log(`User ${userId} joined group ${groupId}`);

      // Notify others in the group
      client.to(`group:${groupId}`).emit('user:joined', {
        userId,
        groupId,
        timestamp: new Date(),
      });

      return {
        success: true,
        groupId,
        message: 'Joined group successfully',
      };
    } catch (error) {
      this.logger.error(`Join group error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  /**
   * Leave a group room
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leave:group')
  async handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    try {
      const userId = client.data.user.userId;
      const { groupId } = data;

      await client.leave(`group:${groupId}`);

      this.logger.log(`User ${userId} left group ${groupId}`);

      client.to(`group:${groupId}`).emit('user:left', {
        userId,
        groupId,
        timestamp: new Date(),
      });

      return {
        success: true,
        groupId,
        message: 'Left group successfully',
      };
    } catch (error) {
      this.logger.error(`Leave group error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  /**
   * Send a message
   */
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ): Promise<MessageAckDto> {
    try {
      const userId = client.data.user.userId;
      const { groupId, content } = sendMessageDto;

      // Rate limiting
      if (!this.checkRateLimit(userId)) {
        throw new WsException('Rate limit exceeded.  Please slow down.');
      }

      // Save message to database
      const message = await this.chatService.sendMessage(
        userId,
        sendMessageDto,
      );

      // Emit to other group members
      client.to(`group:${groupId}`).emit('message:new', message);

      // Create notifications for other members
      const group = await this.chatService['prisma'].matchingGroup.findUnique({
        where: { id: groupId },
        include: {
          members: {
            where: {
              userId: { not: userId },
            },
            select: { userId: true },
          },
        },
      });

      if (group) {
        const otherUserIds = group.members.map((m) => m.userId);

        await this.notificationsService.createBulkNotifications(otherUserIds, {
          type: NotificationType.NEW_MESSAGE,
          title: 'New Message',
          message: `${message.sender.firstName || 'Someone'} sent a message`,
          referenceId: message.id,
          referenceType: 'message',
          metadata: { groupId },
        });

        // Emit notifications via socket
        otherUserIds.forEach((uid) => {
          this.server.to(`user:${uid}`).emit('notification:new', {
            type: NotificationType.NEW_MESSAGE,
            groupId,
            messageId: message.id,
          });
        });
      }

      // Send ACK to sender
      return {
        success: true,
        message,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`❌ Send message error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Typing indicator
   */
  @UseGuards(WsJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() typingDto: TypingDto,
  ) {
    try {
      const userId = client.data.user.userId;
      const { groupId, isTyping } = typingDto;

      // Verify membership
      const isMember = await this.chatService.verifyGroupMembership(
        userId,
        groupId,
      );
      if (!isMember) {
        throw new WsException('Not a member of this group');
      }

      // Emit to other group members only
      client.to(`group:${groupId}`).emit('typing:update', {
        userId,
        groupId,
        isTyping,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Typing error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  /**
   * Mark messages as delivered
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('messages:delivered')
  async handleMessagesDelivered(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[] },
  ) {
    try {
      const userId = client.data.user.userId;
      const count = await this.chatService.markAsDelivered(
        data.messageIds,
        userId,
      );

      return { success: true, count };
    } catch (error) {
      this.logger.error(`Mark delivered error: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  /**
   * Mark messages as read
   */
  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('messages:read')
  async handleMessagesRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[]; groupId: string },
  ) {
    try {
      const userId = client.data.user.userId;
      const count = await this.chatService.markAsRead(data.messageIds, userId);

      // Notify sender that messages were read
      client.to(`group:${data.groupId}`).emit('messages:read:update', {
        messageIds: data.messageIds,
        readBy: userId,
        timestamp: new Date(),
      });

      return { success: true, count };
    } catch (error) {
      this.logger.error(`Mark read error: ${error.message}`);
      throw new WsException(error.message);
    }
  }
}
