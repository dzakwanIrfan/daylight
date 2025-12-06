import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
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
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { BulkActionDto } from './dto/bulk-action.dto';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  // PUBLIC ENDPOINTS

  /**
   * Get all active payment methods (Public)
   * Optional query params: countryCode, currency
   */
  @Public()
  @Get()
  async getActivePaymentMethods(
    @Query('countryCode') countryCode?: string,
    @Query('currency') currency?: string,
  ) {
    return this.paymentMethodsService.getActivePaymentMethods(
      countryCode,
      currency,
    );
  }

  /**
   * Get payment methods by country (Public)
   * For checkout page - returns methods grouped by type
   */
  @Public()
  @Get('country/:countryCode')
  async getPaymentMethodsByCountry(@Param('countryCode') countryCode: string) {
    return this.paymentMethodsService.getPaymentMethodsByCountry(countryCode);
  }

  /**
   * Get payment method by code (Public)
   */
  @Public()
  @Get('code/:code')
  async getPaymentMethodByCode(@Param('code') code: string) {
    return this.paymentMethodsService.getPaymentMethodByCode(code);
  }

  /**
   * Calculate fee for payment method (Public)
   */
  @Public()
  @Get('code/:code/calculate-fee')
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
    return this.paymentMethodsService. getPaymentMethods(queryDto);
  }

  /**
   * Get statistics (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/statistics')
  async getStatistics() {
    return this.paymentMethodsService.getStatistics();
  }

  /**
   * Export payment methods (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/export')
  async exportPaymentMethods(@Query() queryDto: QueryPaymentMethodsDto) {
    return this. paymentMethodsService.exportPaymentMethods(queryDto);
  }

  /**
   * Get available countries (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/countries')
  async getAvailableCountries() {
    return this. paymentMethodsService.getAvailableCountries();
  }

  /**
   * Get available currencies (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/currencies')
  async getAvailableCurrencies() {
    return this. paymentMethodsService.getAvailableCurrencies();
  }

  /**
   * Get payment method types (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/types')
  async getPaymentMethodTypes() {
    return this. paymentMethodsService.getPaymentMethodTypes();
  }

  /**
   * Create payment method (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin')
  async createPaymentMethod(@Body() data: CreatePaymentMethodDto) {
    return this.paymentMethodsService.createPaymentMethod(data);
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
    return this. paymentMethodsService.updatePaymentMethod(code, data);
  }

  /**
   * Delete payment method (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/:code')
  async deletePaymentMethod(@Param('code') code: string) {
    return this. paymentMethodsService.deletePaymentMethod(code);
  }

  /**
   * Bulk actions on payment methods (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/bulk')
  async bulkAction(@Body() bulkActionDto: BulkActionDto) {
    return this. paymentMethodsService.bulkAction(bulkActionDto);
  }
}