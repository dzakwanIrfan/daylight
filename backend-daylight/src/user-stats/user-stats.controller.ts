import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { User } from '@prisma/client';

@Controller('user-stats')
@UseGuards(JwtAuthGuard)
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  @Get()
  async getUserStats(@CurrentUser() user: User) {
    return this.userStatsService.getUserStats(user.id);
  }

  @Get('recent-activity')
  async getRecentActivity(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.userStatsService.getRecentActivity(user.id, limitNumber);
  }
}