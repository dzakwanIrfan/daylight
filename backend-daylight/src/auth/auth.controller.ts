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
  HttpStatus 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import type { Response } from 'express'; // Ubah ke import type
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response, @Query('sessionId') sessionId?: string) {
    try {
      let result;

      if (sessionId) {
        // User is registering with Google after personality test
        result = await this.authService.registerWithGoogle(sessionId, req.user);
      } else {
        // User is logging in with Google
        result = await this.authService.googleLogin(req.user);
      }

      // Redirect to frontend with tokens
      const frontendUrl = this.configService.get('FRONTEND_URL');
      const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = this.configService.get('FRONTEND_URL');
      res.redirect(`${frontendUrl}/auth/error?message=${error.message}`);
    }
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
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
  async logout() {
    // In a stateless JWT system, logout is handled client-side
    // If you want to implement token blacklisting, add it here
    return { message: 'Logged out successfully' };
  }
}