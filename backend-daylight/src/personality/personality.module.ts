import { Module } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { PersonalityController } from './personality.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ArchetypeDetailModule } from 'src/archetype-detail/archetype-detail.module';

@Module({
  imports: [
    PrismaModule,
    ArchetypeDetailModule,
  ],
  providers: [PersonalityService],
  controllers: [PersonalityController],
  exports: [PersonalityService],
})
export class PersonalityModule {}