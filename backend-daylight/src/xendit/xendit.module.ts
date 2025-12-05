import { Module, forwardRef } from '@nestjs/common';
import { XenditController } from './xendit.controller';
import { XenditService } from './xendit.service';
import { XenditUtilsService } from './services/xendit-utils.service';
import { XenditFeeCalculatorService } from './services/xendit-fee-calculator.service';
import { XenditResponseParserService } from './services/xendit-response-parser.service';
import { XenditPayloadBuilderService } from './services/xendit-payload-builder.service';
import { XenditPaymentGateway } from './xendit-payment.gateway';
import { JwtModule } from '@nestjs/jwt';
import { XenditSubscriptionService } from './services/xendit-subscription.service';
import { XenditTransactionService } from './services/xendit-transaction.service';
import { XenditWebhookService } from './services/xendit-webhook.service';
import { XenditPaymentService } from './services/xendit-payment.service';

@Module({
  imports: [JwtModule],
  controllers: [XenditController],
  providers: [
    XenditService,
    XenditUtilsService,
    XenditFeeCalculatorService,
    XenditPayloadBuilderService,
    XenditResponseParserService,
    XenditPaymentGateway,
    XenditSubscriptionService,
    XenditTransactionService,
    XenditWebhookService,
    XenditPaymentService,
  ],
  exports: [XenditService, XenditPaymentGateway],
})
export class XenditModule { }
