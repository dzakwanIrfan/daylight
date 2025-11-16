import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserEventsService } from './user-events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('user-events')
@UseGuards(JwtAuthGuard)
export class UserEventsController {
  constructor(private userEventsService: UserEventsService) {}

  /**
   * Get user's upcoming events (paid and not passed)
   */
  @Get('my-events')
  async getMyEvents(@CurrentUser() user: any) {
    return this.userEventsService.getMyEvents(user.id);
  }

  /**
   * Get user's past events
   */
  @Get('past-events')
  async getPastEvents(@CurrentUser() user: any) {
    return this.userEventsService.getPastEvents(user.id);
  }
}