import { Injectable } from '@nestjs/common';
import { User, PaymentMethod } from '@prisma/client';
import { CreateXenditPaymentDto } from './dto/create-xendit-payment.dto';
import { CreatePaymentResponse } from './dto/payment-response.dto';
import { XenditWebhookPayload } from './dto/xendit-webhook-payload.dto';
import { QueryXenditTransactionsDto } from './dto/query-xendit-transactions.dto';
import { XenditPaymentService } from './services/xendit-payment.service';
import { XenditWebhookService } from './services/xendit-webhook.service';
import { XenditTransactionService } from './services/xendit-transaction.service';

@Injectable()
export class XenditService {
  constructor(
    private readonly paymentService: XenditPaymentService,
    private readonly webhookService: XenditWebhookService,
    private readonly transactionService: XenditTransactionService,
  ) { }

  async createXenditPayment(
    user: User,
    data: CreateXenditPaymentDto,
  ): Promise<CreatePaymentResponse> {
    return this.paymentService.createXenditPayment(user, data);
  }

  async handleWebhook(webhookPayload: XenditWebhookPayload): Promise<void> {
    return this.webhookService.handleWebhook(webhookPayload);
  }

  async getAvailablePaymentMethods(user: User): Promise<PaymentMethod[]> {
    return this.paymentService.getAvailablePaymentMethods(user);
  }

  async calculateFeePreview(
    amount: number,
    paymentMethodId: string,
  ): Promise<any> {
    return this.paymentService.calculateFeePreview(amount, paymentMethodId);
  }

  async getTransactionDetail(externalId: string, userId: string) {
    return this.transactionService.getTransactionDetail(externalId, userId);
  }

  async getUserTransactions(userId: string, query: QueryXenditTransactionsDto) {
    return this.transactionService.getUserTransactions(userId, query);
  }
}
