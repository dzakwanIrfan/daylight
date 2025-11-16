import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserEventsService } from './user-events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterFreeEventDto } from './dto/register-free-event.dto';

@Controller('user-events')
@UseGuards(JwtAuthGuard)
export class UserEventsController {
  constructor(private userEventsService: UserEventsService) {}

  @Get('my-events')
  async getMyEvents(@CurrentUser() user: any) {
    return this.userEventsService.getMyEvents(user.id);
  }

  @Get('past-events')
  async getPastEvents(@CurrentUser() user: any) {
    return this.userEventsService.getPastEvents(user.id);
  }

  /**
   * Register for event with active subscription (FREE)
   */
  @Post('register-free')
  @HttpCode(HttpStatus.CREATED)
  async registerFreeEvent(
    @CurrentUser() user: any,
    @Body() dto: RegisterFreeEventDto,
  ) {
    return this.userEventsService.registerFreeEvent(user.id, dto);
  }
}