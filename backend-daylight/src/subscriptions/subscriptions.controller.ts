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
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './dto/subscription-plan.dto';
import { CancelSubscriptionDto } from './dto/subscribe.dto';
import { QueryUserSubscriptionsDto } from './dto/query-subscriptions.dto';
import { QueryAdminSubscriptionsDto } from './dto/query-admin-subscriptions.dto';
import { BulkSubscriptionActionDto } from './dto/bulk-subscription-action.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // PUBLIC ENDPOINTS

  /**
   * Get all active subscription plans
   */
  @Public()
  @Get('plans')
  async getActivePlans() {
    return this.subscriptionsService.getActivePlans();
  }

  /**
   * Get plan by ID
   */
  @Public()
  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    return this.subscriptionsService.getPlanById(id);
  }

  // USER ENDPOINTS

  /**
   * Get user's active subscription
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  async getMyActiveSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.getUserActiveSubscription(user.id);
  }

  /**
   * Get user's subscription history
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions')
  async getMySubscriptions(
    @CurrentUser() user: any,
    @Query() queryDto: QueryUserSubscriptionsDto
  ) {
    return this.subscriptionsService.getUserSubscriptions(user.id, queryDto);
  }

  /**
   * Get subscription detail
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions/:id')
  async getMySubscriptionById(
    @CurrentUser() user: any,
    @Param('id') id: string
  ) {
    return this.subscriptionsService.getSubscriptionById(id, user.id);
  }

  /**
   * Cancel subscription
   */
  @UseGuards(JwtAuthGuard)
  @Post('my-subscriptions/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto
  ) {
    return this.subscriptionsService.cancelSubscription(
      id,
      user.id,
      dto.reason
    );
  }

  // ADMIN ENDPOINTS

  /**
   * Get all plans (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/plans')
  async getAllPlans(@Query('isActive') isActive?: string) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.subscriptionsService.getAllPlans(active);
  }

  /**
   * Create plan (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/plans')
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  /**
   * Update plan (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  /**
   * Delete plan (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.deletePlan(id);
  }

  /**
   * Get all subscriptions (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async getAllSubscriptions(@Query() queryDto: any) {
    return this.subscriptionsService.getAllSubscriptions(queryDto);
  }

  /**
   * Get subscription statistics (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/stats')
  async getSubscriptionStats() {
    return this.subscriptionsService.getSubscriptionStats();
  }

  /**
   * Get all subscriptions with advanced filters (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/subscriptions')
  async getAdminSubscriptions(@Query() queryDto: QueryAdminSubscriptionsDto) {
    return this.subscriptionsService.getAdminSubscriptions(queryDto);
  }

  /**
   * Bulk actions on subscriptions (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/subscriptions/bulk')
  @HttpCode(HttpStatus.OK)
  async bulkSubscriptionAction(@Body() bulkActionDto: BulkSubscriptionActionDto) {
    return this.subscriptionsService.bulkSubscriptionAction(bulkActionDto);
  }

  /**
   * Export subscriptions (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/subscriptions/export')
  async exportSubscriptions(@Query() queryDto: QueryAdminSubscriptionsDto) {
    return this.subscriptionsService.exportSubscriptions(queryDto);
  }
}