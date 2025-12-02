import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalityArchetype, RelationshipStatus, GenderMixComfort, Prisma } from '@prisma/client';
import {
  AnswerInput,
  TraitScores,
  PersonalityCalculationResult,
  ContextData,
  AnswerJson,
} from './types/personality.types';
import { ArchetypeDetailService } from 'src/archetype-detail/archetype-detail.service';

@Injectable()
export class PersonalityService {
  constructor(
    private prisma: PrismaService,
    private archetypeDetailService: ArchetypeDetailService,
  ) {}

  /**
   * Calculate personality result with improved accuracy
   */
  async calculatePersonality(answers: AnswerInput[]): Promise<PersonalityCalculationResult> {
    // Fetch all questions with their options
    const questions = await this.prisma.question.findMany({
      where: { isActive: true },
      include: { options: true },
    });

    // Initialize trait scores
    const traitScores: TraitScores = {
      E: 0,  // Energy: Extrovert(+) ↔ Introvert(-)
      O: 0,  // Openness: Abstract/curious(+) ↔ Practical/light(-)
      S: 0,  // Structure: Flexible/Playful(+) ↔ Structured(-)
      A: 0,  // Affect: Feeling(+) ↔ Thinking(-)
      C: 0,  // Comfort with strangers (0-20 scale)
      L: 0,  // Lifestyle tier (1-3 scale)
    };

    // Process each answer
    for (const answer of answers) {
      const question = questions.find(q => q.questionNumber === answer.questionNumber);
      
      if (!question) {
        throw new BadRequestException(`Question ${answer.questionNumber} not found`);
      }

      const option = question.options.find(opt => opt.optionKey === answer.selectedOption);
      
      if (!option) {
        throw new BadRequestException(
          `Option ${answer.selectedOption} not found for question ${answer.questionNumber}`
        );
      }

      // Apply trait impacts
      const impacts = option.traitImpacts as Prisma.JsonObject;
      
      for (const [trait, value] of Object.entries(impacts)) {
        if (trait in traitScores && typeof value === 'number') {
          traitScores[trait as keyof TraitScores] += value;
        }
      }
    }

    // Clamp raw scores according to documentation
    // E, O, S, A: -10 to +10
    traitScores.E = this.clamp(traitScores.E, -10, 10);
    traitScores.O = this.clamp(traitScores.O, -10, 10);
    traitScores.S = this.clamp(traitScores.S, -10, 10);
    traitScores.A = this.clamp(traitScores.A, -10, 10);
    
    // C: 0 to 20 (no negative, comfort accumulates)
    traitScores.C = this.clamp(traitScores.C, 0, 20);
    
    // L: 1 to 3 (lifestyle tier, no accumulation - should be set directly)
    traitScores.L = this.clamp(traitScores.L, 1, 3);

    // Normalize to 0-100 according to formula
    const normalizedScores = {
      energyScore: ((traitScores.E + 10) / 20) * 100,
      opennessScore: ((traitScores.O + 10) / 20) * 100,
      structureScore: ((traitScores.S + 10) / 20) * 100,
      affectScore: ((traitScores.A + 10) / 20) * 100,
      comfortScore: (traitScores.C / 20) * 100,
      lifestyleScore: ((traitScores.L - 1) / 2) * 100,
    };

    // Calculate profile score with correct weights
    const profileScore =
      0.25 * normalizedScores.energyScore +
      0.20 * normalizedScores.opennessScore +
      0.15 * normalizedScores.structureScore +
      0.15 * normalizedScores.affectScore +
      0.10 * normalizedScores.lifestyleScore +
      0.10 * normalizedScores.comfortScore +
      0.05 * 50; // +5% base serendipity factor (neutral at 50)

    // Determine archetype with improved logic
    const archetype = this.determineArchetype(traitScores);

    return {
      rawScores: traitScores,
      normalizedScores,
      profileScore: Math.round(profileScore * 100) / 100,
      archetype,
    };
  }

  /**
   * Determine personality archetype based on trait scores
   * Following exact algorithm from documentation
   */
  private determineArchetype(scores: TraitScores): PersonalityArchetype {
    const { E, O, S, A } = scores;

    // Define flags according to documentation
    const E_hi = E >= 5;
    const E_lo = E <= -5;
    const O_hi = O >= 5;
    const O_lo = O <= -5;
    const S_flex = S >= 5;      // Positive S = Flexible
    const S_struct = S <= -5;   // Negative S = Structured
    const A_feel = A >= 5;      // Positive A = Feeling
    const A_think = A <= -5;    // Negative A = Thinking
    
    // Balanced checks
    const E_balanced = Math.abs(E) < 5;
    const A_balanced = Math.abs(A) < 5;

    // Archetype rules (first match wins) - following MD documentation order
    
    // 1. Bright Morning: Optimistic extrovert
    if (E_hi && A_feel && (O_hi || S_flex)) {
      return PersonalityArchetype.BRIGHT_MORNING;
    }
    
    // 2. Calm Dawn: Gentle introvert
    if (E_lo && A_feel && (S_struct || O_hi)) {
      return PersonalityArchetype.CALM_DAWN;
    }
    
    // 3. Bold Noon: Driven, focused leader
    if (E_hi && A_think && S_struct) {
      return PersonalityArchetype.BOLD_NOON;
    }
    
    // 4. Golden Hour: Charismatic, expressive
    if (E_hi && A_feel && O_hi && S_flex) {
      return PersonalityArchetype.GOLDEN_HOUR;
    }
    
    // 5. Quiet Dusk: Deep, reflective thinker
    if (E_lo && A_think && (O_hi || S_struct)) {
      return PersonalityArchetype.QUIET_DUSK;
    }
    
    // 6. Cloudy Day: Creative, empathetic, dreamy
    if (E_lo && A_feel && O_hi && S_flex) {
      return PersonalityArchetype.CLOUDY_DAY;
    }
    
    // 7. Serene Drizzle: Steady, supportive
    if (A_feel && S_struct && (E_lo || E_balanced)) {
      return PersonalityArchetype.SERENE_DRIZZLE;
    }
    
    // 8. Blazing Noon: Decisive, bold
    if (E_hi && A_think && (O_lo || S_struct)) {
      return PersonalityArchetype.BLAZING_NOON;
    }
    
    // 9. Starry Night: Visionary, independent
    if (E_lo && O_hi && (A_think || A_balanced)) {
      return PersonalityArchetype.STARRY_NIGHT;
    }
    
    // 10. Perfect Day: Balanced (default)
    return PersonalityArchetype.PERFECT_DAY;
  }

  /**
   * Save personality result (for anonymous users with sessionId)
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
    const calculation = await this.calculatePersonality(answers);

    const answersJson: AnswerJson = answers.map(a => ({
      questionNumber: a.questionNumber,
      selectedOption: a.selectedOption,
    }));

    const relationshipStatus = this.parseRelationshipStatus(contextData?.relationshipStatus);
    const genderMixComfort = this.parseGenderMixComfort(contextData?.genderMixComfort);

    if (contextData?.currentCityId) {
      const city = await this.prisma.city.findFirst({
        where: { 
          id: contextData.currentCityId,
          isActive: true,
        },
      });

      if (!city) {
        throw new BadRequestException('Invalid or inactive city');
      }
    }

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
      currentCity: contextData?.currentCityId ? { connect: { id: contextData.currentCityId } } : undefined,
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

  async getResultBySession(sessionId: string) {
    const result = await this.prisma.personalityResult.findUnique({
      where: { sessionId },
    });

    if (!result) {
      throw new NotFoundException('Personality result not found');
    }

    return this.formatResult(result);
  }

  async getResultByUserId(userId: string) {
    const result = await this.prisma.personalityResult.findUnique({
      where: { userId },
    });

    if (!result) {
      throw new NotFoundException('Personality result not found');
    }

    return this.formatResult(result);
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

  /**
   * Format personality result for response
   */
  private async formatResult(result: any) {
    const archetypeDetails = await this.getArchetypeDetails(result.archetype);

    return {
      id: result.id,
      archetype: {
        type: result.archetype,
        ...archetypeDetails,
      },
      scores: {
        profile: result.profileScore,
        energy: result.energyScore,
        openness: result.opennessScore,
        structure: result.structureScore,
        affect: result.affectScore,
        comfort: result.comfortScore,
        lifestyle: result.lifestyleScore,
      },
      rawScores: {
        energy: result.energyRaw,
        openness: result.opennessRaw,
        structure: result.structureRaw,
        affect: result.affectRaw,
        comfort: result.comfortRaw,
        lifestyle: result.lifestyleRaw,
      },
      context: {
        relationshipStatus: result.relationshipStatus,
        intentOnDaylight: result.intentOnDaylight,
        genderMixComfort: result.genderMixComfort,
        currentCityId: result.currentCityId,
      },
      createdAt: result.createdAt,
    };
  }

  private async getArchetypeDetails(archetype: PersonalityArchetype) {
    try {
      const details = await this.archetypeDetailService.getArchetypeDetailByArchetype(archetype);
      return {
        symbol: details.symbol,
        name: details.name,
        traits: details.traits,
        description: details.description,
        imageKey: details.imageKey,
      };
    } catch (error) {
      // Fallback to default if not found in database
      return {
        symbol: '🌈',
        name: archetype,
        traits: [],
        description: 'No description available',
        imageKey: archetype.toLowerCase().replace(/_/g, '-'),
      };
    }
  }

  /**
   * Parse relationship status string to enum
   */
  private parseRelationshipStatus(status?: string): RelationshipStatus | undefined {
    if (!status) return undefined;
    
    const validStatuses: Record<string, RelationshipStatus> = {
      SINGLE: RelationshipStatus.SINGLE,
      MARRIED: RelationshipStatus.MARRIED,
      PREFER_NOT_SAY: RelationshipStatus.PREFER_NOT_SAY,
    };

    return validStatuses[status];
  }

  /**
   * Parse gender mix comfort string to enum
   */
  private parseGenderMixComfort(comfort?: string): GenderMixComfort | undefined {
    if (!comfort) return undefined;
    
    const validComforts: Record<string, GenderMixComfort> = {
      TOTALLY_FINE: GenderMixComfort.TOTALLY_FINE,
      PREFER_SAME_GENDER: GenderMixComfort.PREFER_SAME_GENDER,
      DEPENDS: GenderMixComfort.DEPENDS,
    };

    return validComforts[comfort];
  }

  /**
   * Utility: Clamp value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}