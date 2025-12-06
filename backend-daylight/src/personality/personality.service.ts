import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  AnswerInput,
  PersonalityCalculationResult,
  AnswerJson,
} from './types/personality.types';
import { AnswerProcessorService } from './services/answer-processor.service';
import { ScoreCalculatorService } from './services/score-calculator.service';
import { ArchetypeMatcherService } from './services/archetype-matcher.service';
import { ResultFormatterService } from './services/result-formatter.service';
import { ContextParserService } from './services/context-parser.service';

@Injectable()
export class PersonalityService {
  constructor(
    private prisma: PrismaService,
    private answerProcessor: AnswerProcessorService,
    private scoreCalculator: ScoreCalculatorService,
    private archetypeMatcher: ArchetypeMatcherService,
    private resultFormatter: ResultFormatterService,
    private contextParser: ContextParserService,
  ) { }

  /**
   * Calculate personality result with updated scoring weights
   * Updated based on PDF: E(25%), O(10%), S(15%), A(20%), L(20%), C(10%)
   */
  async calculatePersonality(answers: AnswerInput[]): Promise<PersonalityCalculationResult> {
    // Validate answers
    await this.answerProcessor.validateAnswers(answers);

    // Process answers to get raw trait scores
    const rawScores = await this.answerProcessor.processAnswers(answers);

    // Clamp scores to valid ranges
    const clampedScores = this.scoreCalculator.clampTraitScores(rawScores);

    // Normalize scores to 0-100 scale
    const normalizedScores = this.scoreCalculator.normalizeScores(clampedScores);

    // Calculate weighted profile score with updated weights
    const profileScore = this.scoreCalculator.calculateProfileScore(normalizedScores);

    // Determine archetype
    const archetype = this.archetypeMatcher.determineArchetype(clampedScores);

    return {
      rawScores: clampedScores,
      normalizedScores,
      profileScore,
      archetype,
    };
  }

  /**
   * Save personality result for anonymous users
   */
  async saveAnonymousResult(
    sessionId: string,
    answers: AnswerInput[],
    contextData?: {
      relationshipStatus?: string;
      intentOnDaylight?: string[];
      genderMixComfort?: string;
      currentCityId?: string;
    },
  ) {
    // Calculate personality
    const calculation = await this.calculatePersonality(answers);

    // Format answers for storage
    const answersJson: AnswerJson = answers.map(a => ({
      questionNumber: a.questionNumber,
      selectedOption: a.selectedOption,
    }));

    // Parse context data
    const relationshipStatus = this.contextParser.parseRelationshipStatus(
      contextData?.relationshipStatus
    );
    const genderMixComfort = this.contextParser.parseGenderMixComfort(
      contextData?.genderMixComfort
    );

    // Validate city if provided
    await this.contextParser.validateCityId(contextData?.currentCityId);

    // Check if result already exists
    const existing = await this.prisma.personalityResult.findUnique({
      where: { sessionId },
    });

    const dataToSave: Prisma.PersonalityResultCreateInput | Prisma.PersonalityResultUpdateInput = {
      energyRaw: calculation.rawScores.E,
      opennessRaw: calculation.rawScores.O,
      structureRaw: calculation.rawScores.S,
      affectRaw: calculation.rawScores.A,
      comfortRaw: calculation.rawScores.C,
      lifestyleRaw: calculation.rawScores.L,
      energyScore: calculation.normalizedScores.energyScore,
      opennessScore: calculation.normalizedScores.opennessScore,
      structureScore: calculation.normalizedScores.structureScore,
      affectScore: calculation.normalizedScores.affectScore,
      comfortScore: calculation.normalizedScores.comfortScore,
      lifestyleScore: calculation.normalizedScores.lifestyleScore,
      profileScore: calculation.profileScore,
      archetype: calculation.archetype,
      relationshipStatus,
      intentOnDaylight: contextData?.intentOnDaylight || [],
      genderMixComfort,
      currentCity: contextData?.currentCityId
        ? { connect: { id: contextData.currentCityId } }
        : undefined,
      answers: answersJson,
    };

    if (existing) {
      return this.prisma.personalityResult.update({
        where: { sessionId },
        data: dataToSave,
      });
    }

    return this.prisma.personalityResult.create({
      data: {
        ...dataToSave,
        sessionId,
      } as Prisma.PersonalityResultCreateInput,
    });
  }

  /**
   * Link anonymous result to user after registration
   */
  async linkResultToUser(sessionId: string, userId: string) {
    const result = await this.prisma.personalityResult.findUnique({
      where: { sessionId },
    });

    if (!result) {
      throw new NotFoundException('Personality result not found');
    }

    return this.prisma.personalityResult.update({
      where: { id: result.id },
      data: {
        userId,
        sessionId: null,
      },
    });
  }

  /**
   * Get result by session ID
   */
  async getResultBySession(sessionId: string) {
    const result = await this.prisma.personalityResult.findUnique({
      where: { sessionId },
    });

    if (!result) {
      throw new NotFoundException('Personality result not found');
    }

    return this.resultFormatter.formatResult(result);
  }

  /**
   * Get result by user ID
   */
  async getResultByUserId(userId: string) {
    const result = await this.prisma.personalityResult.findUnique({
      where: { userId },
    });

    if (!result) {
      throw new NotFoundException('Personality result not found');
    }

    return this.resultFormatter.formatResult(result);
  }

  /**
   * Get all active questions
   */
  async getQuestions() {
    return this.prisma.question.findMany({
      where: { isActive: true },
      include: {
        options: {
          select: {
            id: true,
            optionKey: true,
            text: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }
}