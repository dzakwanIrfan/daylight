import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { XenditService } from './xendit.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { create } from 'axios';
import { CreateXenditPaymentDto } from './dto/create-xendit-payment.dto';

@Controller('xendit')
export class XenditController {
  constructor(private readonly xenditService: XenditService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createXenditPayment(
    @CurrentUser() user: User,
    @Body() data: CreateXenditPaymentDto,
  ) {
    console.log(user);
    return this.xenditService.createXenditPayment(user, data);
  }
}
