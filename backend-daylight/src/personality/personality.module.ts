import { Module } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { PersonalityController } from './personality.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ArchetypeDetailModule } from 'src/archetype-detail/archetype-detail.module';
import { AnswerProcessorService } from './services/answer-processor.service';
import { ScoreCalculatorService } from './services/score-calculator.service';
import { ArchetypeMatcherService } from './services/archetype-matcher.service';
import { ResultFormatterService } from './services/result-formatter.service';
import { ContextParserService } from './services/context-parser.service';

@Module({
  imports: [
    PrismaModule,
    ArchetypeDetailModule,
  ],
  providers: [
    PersonalityService,
    AnswerProcessorService,
    ScoreCalculatorService,
    ArchetypeMatcherService,
    ResultFormatterService,
    ContextParserService,
  ],
  controllers: [PersonalityController],
  exports: [PersonalityService],
})
export class PersonalityModule { }