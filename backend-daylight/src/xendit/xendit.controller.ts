import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Query,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { XenditService } from './xendit.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { CreateXenditPaymentDto } from './dto/create-xendit-payment.dto';
import type { XenditWebhookPayload } from './dto/xendit-webhook-payload.dto';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { QueryXenditTransactionsDto } from './dto/query-xendit-transactions.dto';

@Controller('xendit')
export class XenditController {
  private readonly logger = new Logger(XenditController.name);

  constructor(
    private readonly xenditService: XenditService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Endpoint untuk create payment
   */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createXenditPayment(
    @CurrentUser() user: User,
    @Body() data: CreateXenditPaymentDto,
  ) {
    return await this.xenditService.createXenditPayment(user, data);
  }

  /**
   * Endpoint untuk mendapatkan payment methods berdasarkan country
   */
  @UseGuards(JwtAuthGuard)
  @Get('payment-methods')
  async getPaymentMethods(@CurrentUser() user: User) {
    return await this.xenditService.getAvailablePaymentMethods(user);
  }

  /**
   * Endpoint untuk preview fee calculation
   */
  @UseGuards(JwtAuthGuard)
  @Get('fee-preview')
  async getFeePreview(
    @Query('amount') amount: string,
    @Query('paymentMethodId') paymentMethodId: string,
  ) {
    const amountNumber = parseFloat(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    return await this.xenditService.calculateFeePreview(
      amountNumber,
      paymentMethodId,
    );
  }

  /**
   * Endpoint untuk get transaction detail dengan actions
   */
  @UseGuards(JwtAuthGuard)
  @Get('transaction/:id')
  async getTransactionDetail(
    @CurrentUser() user: User,
    @Param('id') transactionId: string,
  ) {
    return await this.xenditService.getTransactionDetail(
      transactionId,
      user.id,
    );
  }

  /**
   * Endpoint untuk get user's transactions
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-transactions')
  async getUserTransactions(
    @CurrentUser() user: User,
    @Query() query: QueryXenditTransactionsDto,
  ) {
    return await this.xenditService.getUserTransactions(user.id, query);
  }

  /**
   * Xendit akan hit endpoint ini saat ada perubahan status payment
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-callback-token') callbackToken: string,
    @Body() payload: XenditWebhookPayload,
    @Req() req: Request,
  ) {
    this.logger.log('📨 Received Xendit webhook', {
      event: payload.event,
      callbackToken: callbackToken
        ? '***' + callbackToken.slice(-4)
        : 'MISSING',
    });

    // 1. Validasi callback token dari Xendit
    const webhookToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN');

    if (!webhookToken) {
      this.logger.error('❌ XENDIT_WEBHOOK_TOKEN not configured in . env');
      throw new BadRequestException('Webhook token not configured');
    }

    if (callbackToken !== webhookToken) {
      this.logger.error('❌ Invalid callback token', {
        received: callbackToken ? '***' + callbackToken.slice(-4) : 'MISSING',
        expected: '***' + webhookToken.slice(-4),
      });
      throw new BadRequestException('Invalid callback token');
    }

    this.logger.log('✅ Callback token validated');

    // 2. Process webhook
    try {
      await this.xenditService.handleWebhook(payload);

      this.logger.log('✅ Webhook processed successfully', {
        event: payload.event,
        reference_id: payload.data.reference_id,
      });

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('❌ Webhook processing failed', {
        error: error.message,
        stack: error.stack,
      });

      // Tetap return 200 agar Xendit tidak retry
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
