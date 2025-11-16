import { Module } from '@nestjs/common';
import { UserEventsController } from './user-events.controller';
import { UserEventsService } from './user-events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserEventsController],
  providers: [UserEventsService],
  exports: [UserEventsService],
})
export class UserEventsModule {}