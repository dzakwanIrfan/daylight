import { Module } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { UserStatsController } from './user-stats.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PersonalityModule } from '../personality/personality.module';

@Module({
  imports: [PrismaModule, PersonalityModule],
  controllers: [UserStatsController],
  providers: [UserStatsService],
  exports: [UserStatsService],
})
export class UserStatsModule {}