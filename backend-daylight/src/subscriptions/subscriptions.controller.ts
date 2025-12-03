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
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  UpdateSubscriptionPlanPricesDto,
} from './dto/subscription-plan.dto';
import {
  CreateSubscriptionPlanPriceDto,
  UpdateSubscriptionPlanPriceDto,
} from './dto/subscription-plan-price.dto';
import { CancelSubscriptionDto } from './dto/subscribe.dto';
import { QueryUserSubscriptionsDto } from './dto/query-subscriptions.dto';
import { QueryAdminSubscriptionsDto } from './dto/query-admin-subscriptions.dto';
import { BulkSubscriptionActionDto } from './dto/bulk-subscription-action.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // USER ENDPOINTS

  /**
   * Get all active subscription plans with pricing based on user's location
   */
  @UseGuards(JwtAuthGuard)
  @Get('plans')
  async getActivePlans(@CurrentUser() user: User) {
    return this.subscriptionsService.getActivePlans(user);
  }

  /**
   * Get plan by ID with pricing based on user's location
   */
  @UseGuards(JwtAuthGuard)
  @Get('plans/:id')
  async getPlanById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.subscriptionsService.getPlanById(id, user);
  }

  /**
   * Get user's active subscription
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  async getMyActiveSubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getUserActiveSubscription(user.id);
  }

  /**
   * Get user's subscription history
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions')
  async getMySubscriptions(
    @CurrentUser() user: User,
    @Query() queryDto: QueryUserSubscriptionsDto,
  ) {
    return this.subscriptionsService.getUserSubscriptions(user.id, queryDto);
  }

  /**
   * Get subscription detail
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions/:id')
  async getMySubscriptionById(
    @CurrentUser() user: User,
    @Param('id') id: string,
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
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(
      id,
      user.id,
      dto.reason,
    );
  }

  // ADMIN - SUBSCRIPTION PLANS CRUD

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
   * Get plan by ID (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/plans/:id')
  async getPlanByIdAdmin(@Param('id') id: string) {
    return this.subscriptionsService.getPlanByIdAdmin(id);
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
   * Update plan metadata (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  /**
   * Update plan prices (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/plans/:id/prices')
  async updatePlanPrices(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanPricesDto,
  ) {
    return this.subscriptionsService.updatePlanPrices(id, dto);
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

  // ADMIN - SUBSCRIPTION PLAN PRICES CRUD

  /**
   * Get all prices for a plan (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/plans/:planId/prices')
  async getPlanPrices(@Param('planId') planId: string) {
    return this.subscriptionsService.getPlanPrices(planId);
  }

  /**
   * Add price to plan (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/plans/:planId/prices')
  @HttpCode(HttpStatus.CREATED)
  async addPriceToPlan(
    @Param('planId') planId: string,
    @Body() dto: CreateSubscriptionPlanPriceDto,
  ) {
    return this.subscriptionsService.addPriceToPlan(planId, dto);
  }

  /**
   * Update price (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/prices/:priceId')
  async updatePrice(
    @Param('priceId') priceId: string,
    @Body() dto: UpdateSubscriptionPlanPriceDto,
  ) {
    return this.subscriptionsService.updatePrice(priceId, dto);
  }

  /**
   * Delete price (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/prices/:priceId')
  async deletePrice(@Param('priceId') priceId: string) {
    return this.subscriptionsService.deletePrice(priceId);
  }

  // ADMIN - USER SUBSCRIPTIONS MANAGEMENT

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
  async bulkSubscriptionAction(
    @Body() bulkActionDto: BulkSubscriptionActionDto,
  ) {
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
