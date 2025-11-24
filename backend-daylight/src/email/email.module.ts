import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventReminderService } from './event-reminder.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EmailService, EventReminderService],
  exports: [EmailService, EventReminderService],
})
export class EmailModule {}