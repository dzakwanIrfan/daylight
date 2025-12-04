import { Module } from '@nestjs/common';
import { XenditController } from './xendit.controller';
import { XenditService } from './xendit.service';
import { XenditUtilsService } from './services/xendit-utils.service';
import { XenditFeeCalculatorService } from './services/xendit-fee-calculator.service';
import { XenditResponseParserService } from './services/xendit-response-parser.service';
import { XenditPayloadBuilderService } from './services/xendit-payload-builder.service';

@Module({
  controllers: [XenditController],
  providers: [
    XenditService,
    XenditUtilsService,
    XenditFeeCalculatorService,
    XenditPayloadBuilderService,
    XenditResponseParserService,
  ],
  exports: [XenditService],
})
export class XenditModule {}
