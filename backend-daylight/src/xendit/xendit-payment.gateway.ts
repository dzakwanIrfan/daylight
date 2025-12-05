import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: 'payment',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  transports: ['websocket'],
  pingTimeout: 30000,
  pingInterval: 25000,
})
export class XenditPaymentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(XenditPaymentGateway.name);

  // Simple maps for tracking
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds
  private socketUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Connection attempt from: ${client.id}`);

      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`No token: ${client.id}`);
        client.emit('auth_error', { message: 'No token provided' });
        client.disconnect();
        return;
      }

      const payload = await this.verifyToken(token);
      if (!payload?.sub) {
        this.logger.warn(`Invalid token: ${client.id}`);
        client.emit('auth_error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      const userId = payload.sub;

      // Check user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`User invalid: ${userId}`);
        client.emit('auth_error', { message: 'User not valid' });
        client.disconnect();
        return;
      }

      // Store connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      this.socketUsers.set(client.id, userId);

      // Join user room
      client.join(`user:${userId}`);

      this.logger.log(`✅ Connected: ${client.id} (User: ${userId})`);

      // Send success
      client.emit('connected', {
        success: true,
        userId,
        socketId: client.id,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('auth_error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
      this.logger.log(`Disconnected: ${client.id} (User: ${userId})`);
    }
  }

  @SubscribeMessage('subscribe:payment')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transactionId: string },
  ) {
    try {
      const userId = this.socketUsers.get(client.id);
      if (!userId) {
        return { success: false, message: 'Not authenticated' };
      }

      const { transactionId } = data;

      // Verify transaction belongs to user
      const transaction = await this.prisma.transaction.findFirst({
        where: { id: transactionId, userId },
        select: { id: true, status: true },
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Join transaction room
      client.join(`transaction:${transactionId}`);

      this.logger.log(`Subscribed: ${userId} -> ${transactionId}`);

      return {
        success: true,
        message: 'Subscribed',
        transaction,
      };
    } catch (error) {
      this.logger.error(`Subscribe error: ${error.message}`);
      return { success: false, message: 'Subscribe failed' };
    }
  }

  @SubscribeMessage('unsubscribe:payment')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transactionId: string },
  ) {
    client.leave(`transaction:${data.transactionId}`);
    return { success: true };
  }

  // Emit methods
  emitPaymentStatusUpdate(transactionId: string, data: any) {
    this.server
      .to(`transaction:${transactionId}`)
      .emit('payment:status-update', {
        transactionId,
        ...data,
      });
  }

  emitPaymentUpdateToUser(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('payment:update', data);
  }

  emitPaymentSuccess(transactionId: string, userId: string, data: any) {
    this.server.to(`transaction:${transactionId}`).emit('payment:success', {
      transactionId,
      ...data,
    });
    this.server.to(`user:${userId}`).emit('payment:success', {
      transactionId,
      ...data,
    });
  }

  emitPaymentFailed(transactionId: string, userId: string, data: any) {
    this.server.to(`transaction:${transactionId}`).emit('payment:failed', {
      transactionId,
      ...data,
    });
    this.server.to(`user:${userId}`).emit('payment:failed', {
      transactionId,
      ...data,
    });
  }

  emitPaymentExpired(transactionId: string, userId: string) {
    this.server.to(`transaction:${transactionId}`).emit('payment:expired', {
      transactionId,
    });
    this.server.to(`user:${userId}`).emit('payment:expired', {
      transactionId,
    });
  }

  emitPaymentCountdown(transactionId: string, timeRemaining: number) {
    this.server.to(`transaction:${transactionId}`).emit('payment:countdown', {
      transactionId,
      timeRemaining,
    });
  }

  private extractToken(client: Socket): string | null {
    // 1) Prefer explicit auth token or Authorization header
    const authToken =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');
    if (authToken) return authToken;

    // 2) Fallback: read HttpOnly cookies sent with the handshake
    const cookieHeader = client.handshake.headers?.cookie;
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [k, ...v] = c.trim().split('=');
          return [decodeURIComponent(k), decodeURIComponent(v.join('='))];
        }),
      );
      if (cookies['accessToken']) return cookies['accessToken'];
      if (cookies['refreshToken']) return cookies['refreshToken'];
    }

    return null;
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }

  isUserConnected(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }
}
