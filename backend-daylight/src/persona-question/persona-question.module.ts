import { Module } from '@nestjs/common';
import { PersonaQuestionController } from './persona-question.controller';
import { PersonaQuestionService } from './persona-question.service';

@Module({
  controllers: [PersonaQuestionController],
  providers: [PersonaQuestionService]
})
export class PersonaQuestionModule {}
