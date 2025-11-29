import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { PrismaModule } from '../prisma/prisma.module';

// Import specialized services
import { ParticipantEligibilityService } from './services/participant-eligibility.service';
import { ScoreCalculationService } from './services/score-calculation.service';
import { MatchingAlgorithmService } from './services/matching-algorithm.service';
import { StatisticsService } from './services/statistics.service';
import { ManualAssignmentService } from './services/manual-assignment.service';
import { MatchingPersistenceService } from './services/matching-persistence.service';

@Module({
  imports: [PrismaModule],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    ParticipantEligibilityService,
    ScoreCalculationService,
    MatchingAlgorithmService,
    StatisticsService,
    ManualAssignmentService,
    MatchingPersistenceService,
  ],
  exports: [MatchingService],
})
export class MatchingModule { }