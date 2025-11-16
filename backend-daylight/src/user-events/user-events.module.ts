import { Module } from '@nestjs/common';
import { UserEventsController } from './user-events.controller';
import { UserEventsService } from './user-events.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserEventsController],
  providers: [UserEventsService, SubscriptionsService],
  exports: [UserEventsService],
})
export class UserEventsModule {}