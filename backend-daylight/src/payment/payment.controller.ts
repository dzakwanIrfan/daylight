import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // PUBLIC ENDPOINTS

  /**
   * Get available payment channels
   */
  @Public()
  @Get('channels')
  async getPaymentChannels() {
    return this.paymentService.getPaymentChannels();
  }

  /**
   * Calculate payment fee
   */
  @Public()
  @Get('calculate-fee')
  async calculateFee(
    @Query('amount') amount: number,
    @Query('code') code?: string,
  ) {
    return this.paymentService.calculateFee(amount, code);
  }

  /**
   * Handle payment callback from Tripay
   */
  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handleCallback(@Body() callbackData: PaymentCallbackDto) {
    return this.paymentService.handleCallback(callbackData);
  }

  // USER ENDPOINTS

  /**
   * Create new payment
   */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @CurrentUser() user: any,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(user.id, createPaymentDto);
  }

  /**
   * Get user transactions
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-transactions')
  async getUserTransactions(
    @CurrentUser() user: any,
    @Query() queryDto: QueryTransactionsDto,
  ) {
    return this.paymentService.getUserTransactions(user.id, queryDto);
  }

  /**
   * Get transaction detail
   */
  @UseGuards(JwtAuthGuard)
  @Get('transaction/:id')
  async getTransactionDetail(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.paymentService.getTransactionDetail(id, user.id);
  }

  /**
   * Check payment status
   */
  @UseGuards(JwtAuthGuard)
  @Get('check-status/:id')
  async checkPaymentStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.paymentService.checkPaymentStatus(id, user.id);
  }

  // ADMIN ENDPOINTS

  /**
   * Get all transactions (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/transactions')
  async getAllTransactions(@Query() queryDto: QueryTransactionsDto) {
    return this.paymentService.getAllTransactions(queryDto);
  }

  /**
   * Get payment statistics (Admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/statistics')
  async getPaymentStatistics() {
    return this.paymentService.getPaymentStatistics();
  }
}