import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PersonalityService } from '../personality/personality.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider } from '@prisma/client';
import * as crypto from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private personalityService: PersonalityService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  // Helper: Hash token dengan SHA256
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, firstName, lastName, phoneNumber, sessionId } = registerDto;

    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const personalityResult = await this.personalityService.getResultBySession(sessionId);
      if (!personalityResult) {
        throw new BadRequestException('Please complete the personality test first');
      }

      const user = await this.usersService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        provider: AuthProvider.LOCAL,
        isEmailVerified: false,
      });

      await this.personalityService.linkResultToUser(sessionId, user.id);

      // Generate verification token (plain)
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(verificationToken);
      const expires = new Date(Date.now() + 24 * 3600000);

      await this.usersService.updateEmailVerificationToken(user.id, tokenHash, expires);

      // Send email with PLAIN token
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken, // Plain token in email
        user.firstName || 'User',
      );

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: false,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const user = await this.usersService.findByVerificationToken(tokenHash);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.usersService.verifyEmail(user.id);

    const personalityResult = await this.personalityService.getResultByUserId(user.id);

    if (personalityResult) {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName || 'User',
        personalityResult.archetype.toString(),
      );
    }

    // Generate tokens for auto-login
    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);

    return {
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
      },
      ...tokens,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        success: true,
        message: 'If an account exists, a verification email has been sent',
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(`This account uses ${user.provider} login`);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(verificationToken);
    const expires = new Date(Date.now() + 24 * 3600000);

    await this.usersService.updateEmailVerificationToken(user.id, tokenHash, expires);

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName || 'User',
    );

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in. Check your inbox for the verification link.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async googleLogin(profile: any) {
    let user = await this.usersService.findByGoogleId(profile.id);

    if (!user) {
      user = await this.usersService.findByEmail(profile.email);

      if (user && user.provider === AuthProvider.LOCAL) {
        throw new ConflictException(
          'An account with this email already exists. Please login with your password.',
        );
      }

      throw new BadRequestException('Please complete personality test before registration');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async registerWithGoogle(sessionId: string, profile: any) {
    const personalityResult = await this.personalityService.getResultBySession(sessionId);

    if (!personalityResult) {
      throw new BadRequestException('Please complete the personality test first');
    }

    const user = await this.usersService.createUser({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      provider: AuthProvider.GOOGLE,
      googleId: profile.id,
      isEmailVerified: true,
    });

    await this.personalityService.linkResultToUser(sessionId, user.id);

    await this.emailService.sendWelcomeEmail(
      user.email,
      user.firstName || 'User',
      personalityResult.archetype.toString(),
    );

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        personalityType: personalityResult.archetype,
      },
      ...tokens,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        success: true,
        message: 'If an account exists, a reset link has been sent',
      };
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        `This account uses ${user.provider} login. Please login with ${user.provider}.`,
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(resetToken);
    const expires = new Date(Date.now() + 3600000);

    await this.usersService.updateResetToken(user.id, tokenHash, expires);

    await this.emailService.sendResetPasswordEmail(
      user.email,
      resetToken,
      user.firstName || 'User',
    );

    return {
      success: true,
      message: 'Password reset link sent successfully',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const user = await this.usersService.findByResetToken(tokenHash);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }

  // REFRESH TOKEN MECHANISM
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokenHash = this.hashToken(refreshToken);

    // Check if refresh token exists and not revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);

    return {
      success: true,
      ...tokens,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string, tokenVersion: number): Promise<boolean> {
    const user = await this.usersService.findById(userId);

    if (!user || user.refreshTokenVersion !== tokenVersion) {
      return false;
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      
      // Revoke specific refresh token
      await this.prisma.refreshToken.updateMany({
        where: { 
          userId,
          tokenHash,
        },
        data: { isRevoked: true },
      });
    }

    return { 
      success: true,
      message: 'Logged out successfully' 
    };
  }

  async logoutAll(userId: string) {
    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Increment token version to invalidate all access tokens
    await this.usersService.incrementTokenVersion(userId);

    return {
      success: true,
      message: 'Logged out from all devices successfully',
    };
  }

  private async generateTokens(userId: string, email: string, tokenVersion: number) {
    const accessPayload: TokenPayload = {
      sub: userId,
      email,
      tokenVersion,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: userId,
      email,
      tokenVersion,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'), // 15 minutes
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'), // 7 days
    });

    // Store refresh token hash in database
    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.password) {
      const isValid = await this.usersService.validatePassword(password, user.password);
      if (isValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }
}