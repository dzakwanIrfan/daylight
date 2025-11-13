import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret, 
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req?.cookies?.refreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Only allow refresh tokens
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const isValid = await this.authService.validateRefreshToken(
      payload.sub,
      refreshToken,
      payload.tokenVersion
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return { 
      userId: payload.sub, 
      email: payload.email,
      refreshToken,
    };
  }
}