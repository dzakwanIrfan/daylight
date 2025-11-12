import { Module } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { PersonalityController } from './personality.controller';

@Module({
  providers: [PersonalityService],
  controllers: [PersonalityController],
  exports: [PersonalityService],
})
export class PersonalityModule {}