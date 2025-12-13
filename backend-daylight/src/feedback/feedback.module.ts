import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackAdminController } from './feedback-admin.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackValidationService } from './services/feedback-validation.service';
import { FeedbackStatisticsService } from './services/feedback-statistics.service';
import { FeedbackAdminService } from './services/feedback-admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FeedbackController, FeedbackAdminController],
    providers: [
        FeedbackService,
        FeedbackValidationService,
        FeedbackStatisticsService,
        FeedbackAdminService,
    ],
    exports: [FeedbackService, FeedbackAdminService],
})
export class FeedbackModule { }