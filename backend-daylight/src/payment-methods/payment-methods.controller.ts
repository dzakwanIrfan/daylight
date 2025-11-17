import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { QueryPaymentMethodsDto } from './dto/query-payment-methods.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { BulkActionDto } from './dto/bulk-action.dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  /**
   * Get all active payment methods (Public)
   */
  @Public()
  @Get()
  async getActivePaymentMethods() {
    return this.paymentMethodsService.getActivePaymentMethods();
  }

  /**
   * Get payment method by code (Public)
   */
  @Public()
  @Get(':code')
  async getPaymentMethodByCode(@Param('code') code: string) {
    return this.paymentMethodsService.getPaymentMethodByCode(code);
  }

  /**
   * Calculate fee for payment method (Public)
   */
  @Public()
  @Get(':code/calculate-fee')
  async calculateFee(
    @Param('code') code: string,
    @Query('amount') amount: string,
  ) {
    return this.paymentMethodsService.calculateFee(code, parseFloat(amount));
  }

  // ADMIN ENDPOINTS

  /**
   * Get all payment methods with pagination (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/list')
  async getPaymentMethods(@Query() queryDto: QueryPaymentMethodsDto) {
    return this.paymentMethodsService.getPaymentMethods(queryDto);
  }

  /**
   * Export payment methods (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/export')
  async exportPaymentMethods(@Query() queryDto: QueryPaymentMethodsDto) {
    return this.paymentMethodsService.exportPaymentMethods(queryDto);
  }

  /**
   * Get unique groups (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/groups')
  async getUniqueGroups() {
    return this.paymentMethodsService.getUniqueGroups();
  }

  /**
   * Toggle payment method (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/:code/toggle')
  async togglePaymentMethod(@Param('code') code: string) {
    return this.paymentMethodsService.togglePaymentMethod(code);
  }

  /**
   * Update payment method (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/:code')
  async updatePaymentMethod(
    @Param('code') code: string,
    @Body() data: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.updatePaymentMethod(code, data);
  }

  /**
   * Bulk actions on payment methods (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/bulk')
  async bulkAction(@Body() bulkActionDto: BulkActionDto) {
    return this.paymentMethodsService.bulkAction(bulkActionDto);
  }

  /**
   * Sync with Tripay (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/sync')
  async syncWithTripay(@Body() body: { data: any[] }) {
    return this.paymentMethodsService.syncWithTripay(body.data);
  }
}