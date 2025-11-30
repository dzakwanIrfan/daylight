import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromCookie(client);

      if (!token) {
        this.logger.warn('No token found in cookies');
        throw new WsException('Unauthorized: No token provided');
      }

      const payload = await this.jwtService. verifyAsync(token, {
        secret: this.configService. get<string>('JWT_SECRET'),
      });

      // Verify token type is access token
      if (payload.type !== 'access') {
        throw new WsException('Invalid token type');
      }

      // Attach user data to socket
      client. data.user = {
        userId: payload.sub,
        email: payload.email,
      };

      this.logger.log(`User ${payload.email} authenticated via WebSocket`);
      return true;
    } catch (error) {
      this.logger.error(`WS Auth error: ${error.message}`);
      throw new WsException('Unauthorized: Invalid or expired token');
    }
  }

  private extractTokenFromCookie(client: Socket): string | null {
    try {
      const cookieHeader = client.handshake.headers.cookie;
      
      if (!cookieHeader) {
        return null;
      }

      const cookies = cookie.parse(cookieHeader);
      return cookies. accessToken || null;
    } catch (error) {
      this.logger.error(`Cookie parsing error: ${error. message}`);
      return null;
    }
  }
}