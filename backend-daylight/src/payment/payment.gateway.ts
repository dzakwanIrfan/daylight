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
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  namespace: 'payment',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class PaymentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.verifyToken(token);
      
      if (!payload || !payload.sub) {
        this.logger.warn(`Connection rejected: Invalid token`);
        client.disconnect();
        return;
      }

      const userId = payload.sub;
      
      // Store socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.add(client.id);
      }
      this.socketUsers.set(client.id, userId);

      // Join user's personal room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Send connection success
      client.emit('connected', {
        success: true,
        message: 'Connected to payment updates',
        userId: userId,
      });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    
    if (userId) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.socketUsers.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  /**
   * Subscribe to payment updates
   */
  @SubscribeMessage('subscribe:payment')
  async handleSubscribePayment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transactionId: string },
  ) {
    try {
      const userId = this.socketUsers.get(client.id);
      
      if (!userId) {
        return { success: false, message: 'Unauthorized' };
      }

      const { transactionId } = data;

      // Verify user owns this transaction
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId: userId,
        },
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Join transaction room
      client.join(`transaction:${transactionId}`);

      this.logger.log(`User ${userId} subscribed to transaction ${transactionId}`);

      return {
        success: true,
        message: 'Subscribed to payment updates',
        transaction: {
          id: transaction.id,
          status: transaction.paymentStatus,
          amount: transaction.amount,
        },
      };
    } catch (error) {
      this.logger.error(`Subscribe error: ${error.message}`);
      return { success: false, message: 'Failed to subscribe' };
    }
  }

  /**
   * Unsubscribe from payment updates
   */
  @SubscribeMessage('unsubscribe:payment')
  handleUnsubscribePayment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { transactionId: string },
  ) {
    const { transactionId } = data;
    client.leave(`transaction:${transactionId}`);
    
    this.logger.log(`Client ${client.id} unsubscribed from transaction ${transactionId}`);
    
    return {
      success: true,
      message: 'Unsubscribed from payment updates',
    };
  }

  /**
   * Emit payment status update to specific transaction
   */
  emitPaymentStatusUpdate(transactionId: string, data: any) {
    this.server.to(`transaction:${transactionId}`).emit('payment:status-update', {
      transactionId,
      status: data.status,
      paidAt: data.paidAt,
      updatedAt: data.updatedAt,
      message: this.getStatusMessage(data.status),
    });

    this.logger.log(`Payment status update sent for transaction ${transactionId}: ${data.status}`);
  }

  /**
   * Emit payment update to specific user
   */
  emitPaymentUpdateToUser(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('payment:update', data);
    this.logger.log(`Payment update sent to user ${userId}`);
  }

  /**
   * Emit payment success
   */
  emitPaymentSuccess(transactionId: string, userId: string, data: any) {
    // Emit to transaction room
    this.server.to(`transaction:${transactionId}`).emit('payment:success', {
      transactionId,
      event: data.event,
      amount: data.amount,
      paidAt: data.paidAt,
      message: 'Pembayaran berhasil! 🎉',
    });

    // Emit to user room
    this.server.to(`user:${userId}`).emit('payment:success', {
      transactionId,
      event: data.event,
      message: 'Pembayaran berhasil! Tiket Anda sudah dikonfirmasi.',
    });

    this.logger.log(`Payment success notification sent for transaction ${transactionId}`);
  }

  /**
   * Emit payment failed
   */
  emitPaymentFailed(transactionId: string, userId: string, data: any) {
    this.server.to(`transaction:${transactionId}`).emit('payment:failed', {
      transactionId,
      status: data.status,
      message: 'Pembayaran gagal. Silakan coba lagi.',
    });

    this.server.to(`user:${userId}`).emit('payment:failed', {
      transactionId,
      message: 'Pembayaran gagal. Silakan coba lagi.',
    });

    this.logger.log(`Payment failed notification sent for transaction ${transactionId}`);
  }

  /**
   * Emit payment expired
   */
  emitPaymentExpired(transactionId: string, userId: string) {
    this.server.to(`transaction:${transactionId}`).emit('payment:expired', {
      transactionId,
      message: 'Pembayaran kadaluarsa. Silakan buat transaksi baru.',
    });

    this.server.to(`user:${userId}`).emit('payment:expired', {
      transactionId,
      message: 'Pembayaran kadaluarsa. Silakan buat transaksi baru.',
    });

    this.logger.log(`Payment expired notification sent for transaction ${transactionId}`);
  }

  /**
   * Emit payment countdown
   */
  emitPaymentCountdown(transactionId: string, timeRemaining: number) {
    this.server.to(`transaction:${transactionId}`).emit('payment:countdown', {
      transactionId,
      timeRemaining,
      message: `Sisa waktu: ${this.formatTime(timeRemaining)}`,
    });
  }

  /**
   * Extract token from handshake
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    const token = 
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      null;
    
    return token;
  }

  /**
   * Verify JWT token
   */
  private async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get status message
   */
  private getStatusMessage(status: string): string {
    const messages = {
      PENDING: 'Menunggu pembayaran...',
      PAID: 'Pembayaran berhasil! 🎉',
      FAILED: 'Pembayaran gagal',
      EXPIRED: 'Pembayaran kadaluarsa',
      REFUNDED: 'Pembayaran dikembalikan',
    };
    return messages[status] || 'Status tidak diketahui';
  }

  /**
   * Format time remaining
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get user's active sockets
   */
  getUserSockets(userId: string): Set<string> | undefined {
    return this.userSockets.get(userId);
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }
}