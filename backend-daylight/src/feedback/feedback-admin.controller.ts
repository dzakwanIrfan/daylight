import {
    Controller,
    Get,
    Delete,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FeedbackAdminService } from './services/feedback-admin.service';
import { QueryFeedbackAdminDto } from './dto/query-feedback-admin.dto';
import { BulkActionFeedbackDto } from './dto/bulk-action-feedback.dto';

@Controller('admin/feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class FeedbackAdminController {
    constructor(private feedbackAdminService: FeedbackAdminService) { }

    /**
     * Get all feedbacks with advanced filters (Admin)
     */
    @Get()
    async getFeedbackAll(@Query() queryDto: QueryFeedbackAdminDto) {
        return this.feedbackAdminService.getFeedbackAll(queryDto);
    }

    /**
     * Export feedbacks (Admin)
     */
    @Get('export')
    async exportFeedbacks(@Query() queryDto: QueryFeedbackAdminDto) {
        return this.feedbackAdminService.exportFeedbacks(queryDto);
    }

    /**
     * Get feedback overview statistics (Admin Dashboard)
     */
    @Get('stats/overview')
    async getFeedbackOverviewStats() {
        return this.feedbackAdminService.getFeedbackOverviewStats();
    }

    /**
     * Get event feedback analytics (Admin)
     */
    @Get('stats/events/:eventId')
    async getEventFeedbackAnalytics(@Param('eventId') eventId: string) {
        return this.feedbackAdminService.getEventFeedbackAnalytics(eventId);
    }

    /**
     * Get feedback by ID (Admin)
     */
    @Get(':feedbackId')
    async getFeedbackById(@Param('feedbackId') feedbackId: string) {
        return this.feedbackAdminService.getFeedbackByIdAdmin(feedbackId);
    }

    /**
     * Delete feedback (Admin)
     */
    @Delete(':feedbackId')
    @HttpCode(HttpStatus.OK)
    async deleteFeedback(@Param('feedbackId') feedbackId: string) {
        return this.feedbackAdminService.deleteFeedbackAdmin(feedbackId);
    }

    /**
     * Bulk action on feedbacks (Admin)
     */
    @Post('bulk')
    @HttpCode(HttpStatus.OK)
    async bulkAction(@Body() bulkActionDto: BulkActionFeedbackDto) {
        return this.feedbackAdminService.bulkAction(bulkActionDto);
    }
}