import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PersonalityService } from '../personality/personality.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProvider } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private personalityService: PersonalityService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, firstName, lastName, phoneNumber, sessionId } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Check if personality test was completed
      const personalityResult = await this.personalityService.getResultBySession(sessionId);
      if (!personalityResult) {
        throw new BadRequestException('Please complete the personality test first');
      }

      // Create user (not verified yet)
      const user = await this.usersService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        provider: AuthProvider.LOCAL,
        isEmailVerified: false,
      });

      // Link personality result to user
      await this.personalityService.linkResultToUser(sessionId, user.id);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 3600000); // 24 hours

      await this.usersService.updateEmailVerificationToken(user.id, verificationToken, expires);

      // Send verification email
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
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Verify email
    await this.usersService.verifyEmail(user.id);

    // Get personality result for welcome email
    const personalityResult = await this.personalityService.getResultByUserId(user.id);

    // Send welcome email
    if (personalityResult) {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName || 'User',
        personalityResult.archetype.name,
      );
    }

    // Generate tokens for auto-login
    const tokens = this.generateTokens(user.id, user.email);

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
        message: 'If an account exists, a verification email has been sent' 
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(`This account uses ${user.provider} login`);
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 3600000);

    await this.usersService.updateEmailVerificationToken(user.id, verificationToken, expires);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName || 'User',
    );

    return { 
      success: true,
      message: 'Verification email sent successfully' 
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
        'Please verify your email address before logging in. Check your inbox for the verification link.'
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const tokens = this.generateTokens(user.id, user.email);

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
        throw new ConflictException('An account with this email already exists. Please login with your password.');
      }

      throw new BadRequestException('Please complete personality test before registration');
    }

    const tokens = this.generateTokens(user.id, user.email);

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
      personalityResult.archetype.name,
    );

    const tokens = this.generateTokens(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        personalityType: personalityResult.archetype.type,
      },
      ...tokens,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return { 
        success: true,
        message: 'If an account exists, a reset link has been sent' 
      };
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(`This account uses ${user.provider} login. Please login with ${user.provider}.`);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await this.usersService.updateResetToken(user.id, resetToken, expires);

    await this.emailService.sendResetPasswordEmail(
      user.email, 
      resetToken, 
      user.firstName || 'User'
    );

    return { 
      success: true,
      message: 'Password reset link sent successfully' 
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    return { 
      success: true,
      message: 'Password has been reset successfully' 
    };
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
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