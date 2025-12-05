import { Module, forwardRef } from '@nestjs/common';
import { XenditController } from './xendit.controller';
import { XenditService } from './xendit.service';
import { XenditUtilsService } from './services/xendit-utils.service';
import { XenditFeeCalculatorService } from './services/xendit-fee-calculator.service';
import { XenditResponseParserService } from './services/xendit-response-parser.service';
import { XenditPayloadBuilderService } from './services/xendit-payload-builder.service';
import { XenditPaymentGateway } from './xendit-payment.gateway';
import { JwtModule } from '@nestjs/jwt';

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
  ],
  exports: [XenditService, XenditPaymentGateway],
})
export class XenditModule {}
