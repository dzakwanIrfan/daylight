import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsExportService } from './analytics-export.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsExportService],
  exports: [AnalyticsService, AnalyticsExportService],
})
export class AnalyticsModule {}