import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthProvider } from '@prisma/client';

interface CreateUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  provider?: AuthProvider;
  googleId?: string;
  isEmailVerified?: boolean;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserData) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12); // Increased to 12 rounds
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        provider: data.provider || AuthProvider.LOCAL,
        googleId: data.googleId,
        isEmailVerified: data.isEmailVerified || false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePicture: true,
        provider: true,
        isEmailVerified: true,
        refreshTokenVersion: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePicture: true,
        provider: true,
        isEmailVerified: true,
        isActive: true,
        refreshTokenVersion: true,
        createdAt: true,
        personalityResult: true,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateResetToken(userId: string, tokenHash: string, expires: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: expires,
      },
    });
  }

  async findByResetToken(tokenHash: string) {
    return this.prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: {
          gte: new Date(),
        },
      },
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordExpires: null,
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateEmailVerificationToken(userId: string, tokenHash: string, expires: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: expires,
      },
    });
  }

  async findByVerificationToken(tokenHash: string) {
    return this.prisma.user.findFirst({
      where: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: {
          gte: new Date(),
        },
      },
    });
  }

  async verifyEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpires: null,
      },
    });
  }

  async incrementTokenVersion(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenVersion: {
          increment: 1,
        },
      },
    });
  }
}