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
    const { email, password, firstName, lastName, phoneNumber, sessionId } = registerDto;

    // Check if personality test was completed
    const personalityResult = await this.personalityService.getResultBySession(sessionId);

    if (!personalityResult) {
      throw new BadRequestException('Please complete the personality test first');
    }

    // Create user
    const user = await this.usersService.createUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      provider: AuthProvider.LOCAL,
    });

    // Link personality result to user
    await this.personalityService.linkResultToUser(sessionId, user.id);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      user.email,
      user.firstName || firstName, 
      personalityResult.archetype.name,
    );

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return {
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

    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async googleLogin(profile: any) {
    let user = await this.usersService.findByGoogleId(profile.id);

    if (!user) {
      // Check if user exists with same email
      user = await this.usersService.findByEmail(profile.emails[0].value);

      if (user) {
        throw new ConflictException('An account with this email already exists. Please login with your password.');
      }

      // User doesn't exist, need to register
      // In real flow, this would redirect to complete personality test
      throw new BadRequestException('Please complete personality test before registration');
    }

    const tokens = this.generateTokens(user.id, user.email);

    return {
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
    // Check if personality test was completed
    const personalityResult = await this.personalityService.getResultBySession(sessionId);

    if (!personalityResult) {
      throw new BadRequestException('Please complete the personality test first');
    }

    // Create user with Google
    const user = await this.usersService.createUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      provider: AuthProvider.GOOGLE,
      googleId: profile.id,
      isEmailVerified: true,
    });

    // Link personality result to user
    await this.personalityService.linkResultToUser(sessionId, user.id);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      user.email,
      user.firstName || profile.name.givenName,
      personalityResult.archetype.name,
    );

    const tokens = this.generateTokens(user.id, user.email);

    return {
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
      // Don't reveal if user exists
      return { message: 'If an account exists, a reset link has been sent' };
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(`This account uses ${user.provider} login. Please login with ${user.provider}.`);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.updateResetToken(user.id, resetToken, expires);

    // Send reset email
    await this.emailService.sendResetPasswordEmail(
      user.email, 
      resetToken, 
      user.firstName || 'User' 
    );

    return { message: 'If an account exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    return { message: 'Password has been reset successfully' };
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