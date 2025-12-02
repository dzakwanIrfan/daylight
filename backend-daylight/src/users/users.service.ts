import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthProvider, UserRole, SubscriptionStatus } from '@prisma/client';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

interface CreateUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  provider?: AuthProvider;
  googleId?: string;
  isEmailVerified?: boolean;
  profilePicture?: string;
  role?: string;
  currentCityId?: string;
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

    // Validate city if provided
    if (data.currentCityId) {
      const city = await this.prisma. city.findFirst({
        where: { 
          id: data.currentCityId,
          isActive: true,
        },
      });

      if (! city) {
        throw new BadRequestException('Invalid or inactive city');
      }
    }

    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12);
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
        profilePicture: data.profilePicture,
        role: UserRole.USER,
        currentCityId: data.currentCityId, 
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
        currentCityId: true, 
        currentCity: { 
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
      },
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
        role: true,
        currentCityId: true,
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
      include: {
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
      },
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
      include: {
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
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

    // Get active subscription
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

    return {
      ...user,
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        planId: activeSubscription.planId,
        planName: activeSubscription.plan.name,
        planType: activeSubscription.plan.type,
        status: activeSubscription.status,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
      } : null,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phoneNumber: updateProfileDto.phoneNumber,
        profilePicture: updateProfileDto.profilePicture,
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
        createdAt: true,
        role: true,
        currentCityId: true,
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    // Get subscription info
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

    return {
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        hasActiveSubscription: !!activeSubscription,
        subscription: activeSubscription ? {
          id: activeSubscription.id,
          planId: activeSubscription.planId,
          planName: activeSubscription.plan.name,
          planType: activeSubscription.plan.type,
          status: activeSubscription.status,
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate,
        } : null,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Cannot change password for OAuth accounts');
    }

    const isValidPassword = await this.validatePassword(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await this.validatePassword(
      changePasswordDto.newPassword,
      user.password
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    await this.updatePassword(userId, changePasswordDto.newPassword);

    return {
      message: 'Password changed successfully',
    };
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
      include: {
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
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

  async updateGoogleId(userId: string, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }

  // Update user's current city
  async updateCurrentCity(userId: string, cityId: string) {
    // Validate city exists and is active
    const city = await this.prisma.city.findFirst({
      where: { 
        id: cityId,
        isActive: true,
      },
    });

    if (! city) {
      throw new BadRequestException('Invalid or inactive city');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { currentCityId: cityId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        currentCityId: true,
        currentCity: {
          select: {
            id: true,
            slug: true,
            name: true,
            timezone: true,
            country: {
              select: {
                id: true,
                code: true,
                name: true,
                currency: true,
              },
            },
          },
        },
      },
    });
  }
}