import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PersonalityService } from '../personality/personality.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider, UserRole, SubscriptionStatus } from '@prisma/client';
import * as crypto from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  type: 'access' | 'refresh';
}

export const AuthErrorMessages = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_NOT_FOUND: 'Token not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified',
  PROVIDER_MISMATCH: 'This account uses a different login method',
  PERSONALITY_TEST_REQUIRED: 'Please complete the persona test first',
  SESSION_EXPIRED: 'Session expired. Please login again',
} as const;

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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async getUserSubscriptionStatus(userId: string) {
    const now = new Date();

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            type: true,
            durationInMonths: true,
          },
        },
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    return activeSubscription ? {
      hasActiveSubscription: true,
      subscription: {
        id: activeSubscription.id,
        planId: activeSubscription.planId,
        planName: activeSubscription.plan.name,
        planType: activeSubscription.plan.type,
        status: activeSubscription.status,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
      },
    } : {
      hasActiveSubscription: false,
      subscription: null,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, firstName, lastName, phoneNumber, sessionId } = registerDto;

    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException(AuthErrorMessages.EMAIL_ALREADY_EXISTS);
      }

      // Verify persona test was completed
      const personalityResult = await this.personalityService.getResultBySession(sessionId);
      if (!personalityResult) {
        throw new BadRequestException(AuthErrorMessages.PERSONALITY_TEST_REQUIRED);
      }

      // Get currentCityId from personality result
      const currentCityId = personalityResult.context?.currentCityId;

      const user = await this.usersService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        provider: AuthProvider.LOCAL,
        isEmailVerified: false,
        currentCityId,
      });

      await this.personalityService.linkResultToUser(sessionId, user.id);

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
        message: 'Registration successful! Please check your email to verify your account.',
        requiresVerification: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: false,
          currentCityId: user.currentCityId,
          currentCity: user.currentCity,
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
      throw new BadRequestException(AuthErrorMessages.INVALID_TOKEN);
    }

    await this.usersService.verifyEmail(user.id);

    const personalityResult = await this.personalityService.getResultByUserId(user.id);

    if (personalityResult) {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName || 'User',
        personalityResult.archetype.name,
      );
    }

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);
    const subscriptionStatus = await this.getUserSubscriptionStatus(user.id);

    return {
      success: true,
      message: 'Email verified successfully! ',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
        role: user.role,
        currentCityId: user.currentCityId,
        currentCity: user.currentCity,
        ...subscriptionStatus,
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
      throw new BadRequestException(AuthErrorMessages.EMAIL_ALREADY_VERIFIED);
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(`${AuthErrorMessages.PROVIDER_MISMATCH}: ${user.provider}`);
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
      throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthErrorMessages.INVALID_CREDENTIALS);
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(AuthErrorMessages.EMAIL_NOT_VERIFIED);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AuthErrorMessages.ACCOUNT_DEACTIVATED);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);
    const subscriptionStatus = await this.getUserSubscriptionStatus(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        currentCityId: user.currentCityId,
        currentCity: user.currentCity,
        ...subscriptionStatus,
      },
      ...tokens,
    };
  }

  async googleLogin(profile: any) {
    let user = await this.usersService.findByGoogleId(profile.id);

    if (!user) {
      user = await this.usersService.findByEmail(profile.email);

      if (user) {
        // Automatically link account if email matches but Google ID is missing
        if (!user.googleId) {
          await this.usersService.updateGoogleId(user.id, profile.id);
        }
      } else {
        throw new BadRequestException(AuthErrorMessages.PERSONALITY_TEST_REQUIRED);
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AuthErrorMessages.ACCOUNT_DEACTIVATED);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);
    const subscriptionStatus = await this.getUserSubscriptionStatus(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        currentCityId: user.currentCityId,
        currentCity: user.currentCity,
        ...subscriptionStatus,
      },
      ...tokens,
    };
  }

  async registerWithGoogle(sessionId: string, profile: any) {
    const personalityResult = await this.personalityService.getResultBySession(sessionId);

    if (!personalityResult) {
      throw new BadRequestException(AuthErrorMessages.PERSONALITY_TEST_REQUIRED);
    }

    const existingUserByEmail = await this.usersService.findByEmail(profile.email);
    if (existingUserByEmail) {
      throw new ConflictException(AuthErrorMessages.EMAIL_ALREADY_EXISTS);
    }

    const existingUserByGoogleId = await this.usersService.findByGoogleId(profile.id);
    if (existingUserByGoogleId) {
      throw new ConflictException('This Google account is already registered');
    }

    // Get currentCityId from personality result
    const currentCityId = personalityResult.context?.currentCityId;

    const user = await this.usersService.createUser({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profilePicture: profile.picture,
      provider: AuthProvider.GOOGLE,
      googleId: profile.id,
      isEmailVerified: true,
      role: UserRole.USER,
      currentCityId,
    });

    await this.personalityService.linkResultToUser(sessionId, user.id);

    await this.emailService.sendWelcomeEmail(
      user.email,
      user.firstName || 'User',
      personalityResult.archetype.name,
    );

    const tokens = await this.generateTokens(user.id, user.email, user.refreshTokenVersion);
    const subscriptionStatus = await this.getUserSubscriptionStatus(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: true,
        role: UserRole.USER,
        currentCityId: user.currentCityId,
        currentCity: user.currentCity,
        ...subscriptionStatus,
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
        `${AuthErrorMessages.PROVIDER_MISMATCH}: Please login with ${user.provider}. `,
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
      throw new BadRequestException(AuthErrorMessages.INVALID_TOKEN);
    }

    await this.usersService.updatePassword(user.id, newPassword);

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(AuthErrorMessages.USER_NOT_FOUND);
    }

    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new UnauthorizedException(AuthErrorMessages.INVALID_REFRESH_TOKEN);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(AuthErrorMessages.INVALID_REFRESH_TOKEN);
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

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
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

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
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000);

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