import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QueryUsersDto } from './dto/query-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkActionDto } from './dto/bulk-action.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * Get dashboard statistics
   */
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Get all users with filtering, sorting, and pagination
   */
  @Get('users')
  async getUsers(@Query() queryDto: QueryUsersDto) {
    return this.adminService.getUsers(queryDto);
  }

  /**
   * Export users data
   */
  @Get('users/export')
  async exportUsers(@Query() queryDto: QueryUsersDto) {
    return this.adminService.exportUsers(queryDto);
  }

  /**
   * Get user by ID
   */
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  /**
   * Create new user
   */
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  /**
   * Update user
   */
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  /**
   * Delete user
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Query('hard') hard?: string) {
    const hardDelete = hard === 'true';
    return this.adminService.deleteUser(id, hardDelete);
  }

  /**
   * Bulk actions on users
   */
  @Post('users/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionDto) {
    return this.adminService.bulkAction(bulkActionDto);
  }

  /**
   * Reset user password
   */
  @Patch('users/:id/reset-password')
  async resetUserPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.adminService.resetUserPassword(id, newPassword);
  }
}