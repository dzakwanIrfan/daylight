import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(verifyEmailDto.token);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendVerificationDto.email);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshTokens(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(
      user.userId,
      user.refreshToken,
    );
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  /**
   * Initiate Google OAuth dengan state parameter
   */
  @Public()
  @Get('google')
  async googleAuth(
    @Query('sessionId') sessionId: string,
    @Res() res: Response,
  ) {
    let state = '';
    
    if (sessionId) {
      const stateData = { sessionId };
      state = Buffer.from(JSON.stringify(stateData)).toString('base64');
    }

    const googleAuthUrl = this.buildGoogleAuthUrl(state);
    res.redirect(googleAuthUrl);
  }

  /**
   * Google callback - Set cookie via Set-Cookie header then redirect dengan token di URL
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const googleUser = req.user;
      let result;

      if (googleUser.sessionId) {
        result = await this.authService.registerWithGoogle(
          googleUser.sessionId,
          googleUser,
        );
      } else {
        result = await this.authService.googleLogin(googleUser);
      }

      const frontendUrl = this.configService.get('FRONTEND_URL');
      const isProduction = this.configService.get('NODE_ENV') === 'production';
      
      // Pass tokens via URL for intermediate page to process
      // Intermediate page will call /auth/session-login to set httpOnly cookies properly
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('token', result.accessToken);
      redirectUrl.searchParams.set('refresh', result.refreshToken);

      res.redirect(redirectUrl.toString());
    } catch (error) {
      const frontendUrl = this.configService.get('FRONTEND_URL');
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }

  /**
   * Session login endpoint - untuk set cookies dari frontend
   * Frontend akan call endpoint ini dengan tokens dari URL
   */
  @Public()
  @Post('session-login')
  @HttpCode(HttpStatus.OK)
  async sessionLogin(
    @Body() body: { accessToken: string; refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Validate tokens
      if (!body.accessToken || !body.refreshToken) {
        throw new Error('Tokens are required');
      }

      // Set httpOnly cookies
      this.setAuthCookies(res, body.accessToken, body.refreshToken);

      return {
        success: true,
        message: 'Session established successfully',
      };
    } catch (error) {
      throw new Error('Failed to establish session');
    }
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(user.userId, refreshToken);
    this.clearAuthCookies(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.userId);
    this.clearAuthCookies(res);
    return { success: true, message: 'Logged out from all devices' };
  }

  /**
   * Build Google OAuth URL dengan state parameter
   */
  private buildGoogleAuthUrl(state?: string): string {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const callbackUrl = this.configService.get('GOOGLE_CALLBACK_URL');
    const scope = 'email profile';

    let url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    if (state) {
      url += `&state=${encodeURIComponent(state)}`;
    }

    return url;
  }

  private getExpiryInMs(expiryString: string): number {
    const unit = expiryString.slice(-1);
    const value = parseInt(expiryString.slice(0, -1));

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000;
    }
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    const accessTokenExpiry = this.configService.get('JWT_EXPIRES_IN') || '1d';
    const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessMaxAge = this.getExpiryInMs(accessTokenExpiry);
    const refreshMaxAge = this.getExpiryInMs(refreshTokenExpiry);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      domain: isProduction ? this.configService.get('COOKIE_DOMAIN') : undefined,
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAge,
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    res.clearCookie('sessionId', { path: '/' });
  }
}