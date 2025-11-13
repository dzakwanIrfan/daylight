import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { QueryUsersDto, SortOrder } from './dto/query-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkActionDto, BulkActionType } from './dto/bulk-action.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get users with advanced filtering, sorting, and pagination
   */
  async getUsers(queryDto: QueryUsersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
      role,
      provider,
      isActive,
      isEmailVerified,
      dateFrom,
      dateTo,
    } = queryDto;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by provider
    if (provider) {
      where.provider = provider;
    }

    // Filter by active status
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Filter by email verification
    if (typeof isEmailVerified === 'boolean') {
      where.isEmailVerified = isEmailVerified;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Execute queries
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profilePicture: true,
          role: true,
          provider: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          personalityResult: {
            select: {
              archetype: true,
              profileScore: true,
            },
          },
          _count: {
            select: {
              refreshTokens: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        role,
        provider,
        isActive,
        isEmailVerified,
        dateFrom,
        dateTo,
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        personalityResult: true,
        refreshTokens: {
          where: { isRevoked: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { password, emailVerificationTokenHash, resetPasswordTokenHash, ...userWithoutSensitive } = user;

    return userWithoutSensitive;
  }

  /**
   * Create new user (admin action)
   */
  async createUser(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        role: createUserDto.role || UserRole.USER,
        isEmailVerified: createUserDto.isEmailVerified || false,
        isActive: createUserDto.isActive !== false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        provider: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: 'User created successfully',
      user,
    };
  }

  /**
   * Update user (admin action)
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being changed, check if new email is already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePicture: true,
        role: true,
        provider: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(userId: string, hardDelete: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (hardDelete) {
      // Hard delete - remove from database
      await this.prisma.user.delete({
        where: { id: userId },
      });

      return {
        message: 'User permanently deleted',
      };
    } else {
      // Soft delete - deactivate user
      await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return {
        message: 'User deactivated',
      };
    }
  }

  /**
   * Bulk actions on users
   */
  async bulkAction(bulkActionDto: BulkActionDto) {
    const { userIds, action, role } = bulkActionDto;

    // Validate user IDs
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('Some user IDs are invalid');
    }

    let result;

    switch (action) {
      case BulkActionType.ACTIVATE:
        result = await this.prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true },
        });
        break;

      case BulkActionType.DEACTIVATE:
        result = await this.prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false },
        });
        break;

      case BulkActionType.DELETE:
        result = await this.prisma.user.deleteMany({
          where: { id: { in: userIds } },
        });
        break;

      case BulkActionType.UPDATE_ROLE:
        if (!role) {
          throw new BadRequestException('Role is required for updateRole action');
        }
        result = await this.prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { role },
        });
        break;

      case BulkActionType.VERIFY_EMAIL:
        result = await this.prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isEmailVerified: true },
        });
        break;

      default:
        throw new BadRequestException('Invalid bulk action');
    }

    return {
      message: `Bulk action ${action} completed successfully`,
      affectedCount: result.count,
    };
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
      usersByRole,
      usersByProvider,
      recentUsers,
      usersWithPersonality,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.count({ where: { isEmailVerified: true } }),
      this.prisma.user.count({ where: { isEmailVerified: false } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['provider'],
        _count: true,
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.personalityResult.count({
        where: { userId: { not: null } },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        usersWithPersonality,
      },
      breakdown: {
        byRole: usersByRole.map((item) => ({
          role: item.role,
          count: item._count,
        })),
        byProvider: usersByProvider.map((item) => ({
          provider: item.provider,
          count: item._count,
        })),
      },
      recentUsers,
    };
  }

  /**
   * Reset user password (admin action)
   */
  async resetUserPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider !== 'LOCAL') {
      throw new BadRequestException('Cannot reset password for OAuth users');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordExpires: null,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Export users data
   */
  async exportUsers(queryDto: QueryUsersDto) {
    const { search, role, provider, isActive, isEmailVerified, dateFrom, dateTo } = queryDto;

    // Build where clause (without pagination)
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (provider) where.provider = provider;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isEmailVerified === 'boolean') where.isEmailVerified = isEmailVerified;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        provider: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }
}