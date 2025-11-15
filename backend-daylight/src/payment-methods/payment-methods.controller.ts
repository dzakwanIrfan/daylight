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
   * Get all payment methods including inactive (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async getAllPaymentMethods(@Query('isActive') isActive?: string) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.paymentMethodsService.getAllPaymentMethods(active);
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
  async updatePaymentMethod(@Param('code') code: string, @Body() data: any) {
    return this.paymentMethodsService.updatePaymentMethod(code, data);
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