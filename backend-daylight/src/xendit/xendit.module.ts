import { Module } from '@nestjs/common';
import { XenditController } from './xendit.controller';
import { XenditService } from './xendit.service';
import { XenditUtilsService } from './services/xendit-utils.service';

@Module({
  controllers: [XenditController],
  providers: [XenditService, XenditUtilsService],
  exports: [XenditService],
})
export class XenditModule {}
