import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('recent-users')
  async getRecentUsers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.dashboardService.getRecentUsers(limitNum);
  }

  @Get('upcoming-events')
  async getUpcomingEvents(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 4;
    return this.dashboardService.getUpcomingEvents(limitNum);
  }
}