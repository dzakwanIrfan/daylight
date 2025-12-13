import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { GetFeedbacksDto } from './dto/get-feedbacks.dto';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) { }

    /**
     * Create new feedback
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createFeedback(
        @CurrentUser() user: User,
        @Body() dto: CreateFeedbackDto,
    ) {
        return this.feedbackService.createFeedback(user.id, dto);
    }

    /**
     * Update feedback
     */
    @Patch(':feedbackId')
    @HttpCode(HttpStatus.OK)
    async updateFeedback(
        @Param('feedbackId') feedbackId: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateFeedbackDto,
    ) {
        return this.feedbackService.updateFeedback(feedbackId, user.id, dto);
    }

    /**
     * Delete feedback
     */
    @Delete(':feedbackId')
    @HttpCode(HttpStatus.OK)
    async deleteFeedback(
        @Param('feedbackId') feedbackId: string,
        @CurrentUser() user: User,
    ) {
        return this.feedbackService.deleteFeedback(feedbackId, user.id);
    }

    /**
     * Get feedback by ID
     */
    @Get(':feedbackId')
    async getFeedbackById(@Param('feedbackId') feedbackId: string) {
        return this.feedbackService.getFeedbackById(feedbackId);
    }

    /**
     * Get feedbacks with filters (Admin only)
     */
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getFeedbacks(@Query() dto: GetFeedbacksDto) {
        return this.feedbackService.getFeedbacks(dto);
    }

    /**
     * Get my received feedbacks
     */
    @Get('my/received')
    async getMyReceivedFeedbacks(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.feedbackService.getReceivedFeedbacks(user.id, page, limit);
    }

    /**
     * Get my given feedbacks
     */
    @Get('my/given')
    async getMyGivenFeedbacks(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.feedbackService.getGivenFeedbacks(user.id, page, limit);
    }

    /**
     * Get my rating statistics
     */
    @Get('my/stats')
    async getMyRatingStats(@CurrentUser() user: User) {
        return this.feedbackService.getUserRatingStats(user.id);
    }

    /**
     * Get pending feedbacks for an event
     */
    @Get('events/:eventId/pending')
    async getPendingFeedbacks(
        @Param('eventId') eventId: string,
        @CurrentUser() user: User,
    ) {
        return this.feedbackService.getPendingFeedbacks(user.id, eventId);
    }

    /**
     * Get user's rating statistics (Public or Admin)
     */
    @Get('users/:userId/stats')
    async getUserRatingStats(@Param('userId') userId: string) {
        return this.feedbackService.getUserRatingStats(userId);
    }

    /**
     * Get user's received feedbacks (Public or Admin)
     */
    @Get('users/:userId/received')
    async getUserReceivedFeedbacks(
        @Param('userId') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.feedbackService.getReceivedFeedbacks(userId, page, limit);
    }
}