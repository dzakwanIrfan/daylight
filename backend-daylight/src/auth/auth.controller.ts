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
   * Set cookies THEN redirect
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

      if (googleUser.sessionId && googleUser.sessionId !== 'undefined') {
        result = await this.authService.registerWithGoogle(
          googleUser.sessionId,
          googleUser,
        );
      } else {
        result = await this.authService.googleLogin(googleUser);
      }

      // Set cookies FIRST
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      const frontendUrl = this.configService.get('FRONTEND_URL');
      
      // Redirect tanpa token di URL
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      redirectUrl.searchParams.set('success', 'true');

      res.redirect(redirectUrl.toString());
    } catch (error) {
      const frontendUrl = this.configService.get('FRONTEND_URL');
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
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
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      // Clear cookies first (always do this)
      this.clearAuthCookies(res);
      
      // Then try to invalidate tokens in DB
      if (user?.userId) {
        await this.authService.logout(user.userId, refreshToken);
      }
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      return { success: true, message: 'Logged out successfully' };
    }
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Clear cookies first
      this.clearAuthCookies(res);
      
      // Then try to invalidate all tokens
      if (user?.userId) {
        await this.authService.logoutAll(user.userId);
      }
      
      return { success: true, message: 'Logged out from all devices' };
    } catch (error) {
      return { success: true, message: 'Logged out from all devices' };
    }
  }

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

  /**
   * Cookie configuration untuk production
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get('COOKIE_DOMAIN');
    
    const accessTokenExpiry = this.configService.get('JWT_EXPIRES_IN') || '1d';
    const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessMaxAge = this.getExpiryInMs(accessTokenExpiry);
    const refreshMaxAge = this.getExpiryInMs(refreshTokenExpiry);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // true di production (HTTPS)
      sameSite: isProduction ? 'none' as const : 'lax' as const,
      path: '/',
      domain: isProduction ? cookieDomain : undefined,
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
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get('COOKIE_DOMAIN');

    const clearOptions = {
      path: '/',
      domain: isProduction ? cookieDomain : undefined,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const,
    };

    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
    res.clearCookie('sessionId', clearOptions);
  }
}