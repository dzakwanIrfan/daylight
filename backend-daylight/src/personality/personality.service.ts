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

@Injectable()
export class PersonalityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate personality result from answers
   */
  async calculatePersonality(answers: AnswerInput[]): Promise<PersonalityCalculationResult> {
    // Fetch all questions with their options
    const questions = await this.prisma.question.findMany({
      where: { isActive: true },
      include: { options: true },
    });

    // Initialize trait scores
    const traitScores: TraitScores = {
      E: 0,
      O: 0,
      S: 0,
      A: 0,
      C: 0,
      L: 0,
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

      // Apply trait impacts - Prisma Json type is unknown, so we need to validate it
      const impacts = option.traitImpacts as Prisma.JsonObject;
      
      for (const [trait, value] of Object.entries(impacts)) {
        if (trait in traitScores && typeof value === 'number') {
          traitScores[trait as keyof TraitScores] += value;
        }
      }
    }

    // Clamp raw scores to -10...+10 (except C and L)
    traitScores.E = this.clamp(traitScores.E, -10, 10);
    traitScores.O = this.clamp(traitScores.O, -10, 10);
    traitScores.S = this.clamp(traitScores.S, -10, 10);
    traitScores.A = this.clamp(traitScores.A, -10, 10);

    // Normalize to 0-100
    const normalizedScores = {
      energyScore: ((traitScores.E + 10) / 20) * 100,
      opennessScore: ((traitScores.O + 10) / 20) * 100,
      structureScore: ((traitScores.S + 10) / 20) * 100,
      affectScore: ((traitScores.A + 10) / 20) * 100,
      comfortScore: (traitScores.C / 20) * 100,
      lifestyleScore: ((traitScores.L - 1) / 2) * 100,
    };

    // Calculate profile score (weighted)
    const profileScore =
      0.25 * normalizedScores.energyScore +
      0.20 * normalizedScores.opennessScore +
      0.15 * normalizedScores.structureScore +
      0.15 * normalizedScores.affectScore +
      0.10 * normalizedScores.lifestyleScore +
      0.10 * normalizedScores.comfortScore;

    // Determine archetype
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
   */
  private determineArchetype(scores: TraitScores): PersonalityArchetype {
    const { E, O, S, A } = scores;

    // Define flags
    const E_hi = E >= 5;
    const E_lo = E <= -5;
    const O_hi = O >= 5;
    const O_lo = O <= -5;
    const S_flex = S >= 5;
    const S_struct = S <= -5;
    const A_feel = A >= 5;
    const A_think = A <= -5;

    // Archetype rules (first match wins)
    if (E_hi && A_feel && (O_hi || S_flex)) {
      return PersonalityArchetype.BRIGHT_MORNING;
    }
    if (E_lo && A_feel && (S_struct || O_hi)) {
      return PersonalityArchetype.CALM_DAWN;
    }
    if (E_hi && A_think && S_struct) {
      return PersonalityArchetype.BOLD_NOON;
    }
    if (E_hi && A_feel && O_hi && S_flex) {
      return PersonalityArchetype.GOLDEN_HOUR;
    }
    if (E_lo && A_think && (O_hi || S_struct)) {
      return PersonalityArchetype.QUIET_DUSK;
    }
    if (E_lo && A_feel && O_hi && S_flex) {
      return PersonalityArchetype.CLOUDY_DAY;
    }
    if (A_feel && S_struct && (E_lo || Math.abs(E) < 5)) {
      return PersonalityArchetype.SERENE_DRIZZLE;
    }
    if (E_hi && A_think && (O_lo || S_struct)) {
      return PersonalityArchetype.BLAZING_NOON;
    }
    if (E_lo && O_hi && (A_think || Math.abs(A) < 5)) {
      return PersonalityArchetype.STARRY_NIGHT;
    }
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
    },
  ) {
    const calculation = await this.calculatePersonality(answers);

    // Convert answers to proper JSON format for Prisma
    const answersJson: AnswerJson = answers.map(a => ({
      questionNumber: a.questionNumber,
      selectedOption: a.selectedOption,
    }));

    // Parse context data dengan proper type checking
    const relationshipStatus = this.parseRelationshipStatus(contextData?.relationshipStatus);
    const genderMixComfort = this.parseGenderMixComfort(contextData?.genderMixComfort);

    // Check if result already exists for this session
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
      answers: answersJson,
    };

    if (existing) {
      // Update existing
      return this.prisma.personalityResult.update({
        where: { sessionId },
        data: dataToSave,
      });
    }

    // Create new
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
   * Get personality result by session ID
   */
  async getResultBySession(sessionId: string) {
    const result = await this.prisma.personalityResult.findUnique({
      where: { sessionId },
    });

    if (!result) {
      throw new NotFoundException('Personality result not found');
    }

    return this.formatResult(result);
  }

  /**
   * Get personality result by user ID
   */
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
  private formatResult(result: any) {
    const archetypeDetails = this.getArchetypeDetails(result.archetype);

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
      context: {
        relationshipStatus: result.relationshipStatus,
        intentOnDaylight: result.intentOnDaylight,
        genderMixComfort: result.genderMixComfort,
      },
      createdAt: result.createdAt,
    };
  }

  /**
   * Get archetype details (symbol, traits, description)
   */
  private getArchetypeDetails(archetype: PersonalityArchetype) {
    const details = {
      [PersonalityArchetype.BRIGHT_MORNING]: {
        symbol: '☀️',
        name: 'Bright Morning',
        traits: ['Optimistic', 'Energetic', 'Outgoing'],
        description: 'You bring fresh energy wherever you go. The kind of person who starts the conversation — and the laughter.',
      },
      [PersonalityArchetype.CALM_DAWN]: {
        symbol: '🌅',
        name: 'Calm Dawn',
        traits: ['Gentle', 'Thoughtful', 'Warm'],
        description: 'You move at your own rhythm. People feel comfortable around you — grounded, kind, quietly confident.',
      },
      [PersonalityArchetype.BOLD_NOON]: {
        symbol: '☀️',
        name: 'Bold Noon',
        traits: ['Driven', 'Focused', 'Inspiring'],
        description: 'The go-getter of every table. You lead naturally, keep things on track, and turn ideas into plans.',
      },
      [PersonalityArchetype.GOLDEN_HOUR]: {
        symbol: '🌇',
        name: 'Golden Hour',
        traits: ['Charismatic', 'Expressive', 'Radiant'],
        description: 'You light up rooms with your stories and laughter. Effortlessly social, you make everyone feel seen.',
      },
      [PersonalityArchetype.QUIET_DUSK]: {
        symbol: '🌙',
        name: 'Quiet Dusk',
        traits: ['Deep', 'Analytical', 'Reflective'],
        description: 'You\'re the thinker who listens before you speak — insightful, calm, and full of perspective.',
      },
      [PersonalityArchetype.CLOUDY_DAY]: {
        symbol: '☁️',
        name: 'Cloudy Day',
        traits: ['Creative', 'Empathetic', 'Dreamy'],
        description: 'You see beauty in small moments. Often reserved, but when you open up, your words hit deep.',
      },
      [PersonalityArchetype.SERENE_DRIZZLE]: {
        symbol: '🌧️',
        name: 'Serene Drizzle',
        traits: ['Loyal', 'Calm', 'Supportive'],
        description: 'You don\'t chase attention — you create peace. You\'re the steady soul who listens and understands.',
      },
      [PersonalityArchetype.BLAZING_NOON]: {
        symbol: '🔥',
        name: 'Blazing Noon',
        traits: ['Passionate', 'Decisive', 'Fearless'],
        description: 'You bring heat and direction. When others hesitate, you move — pure action and confidence.',
      },
      [PersonalityArchetype.STARRY_NIGHT]: {
        symbol: '⭐',
        name: 'Starry Night',
        traits: ['Visionary', 'Independent', 'Intuitive'],
        description: 'You live in ideas and imagination. You connect through stories, purpose, and shared curiosity.',
      },
      [PersonalityArchetype.PERFECT_DAY]: {
        symbol: '🌈',
        name: 'Perfect Day',
        traits: ['Balanced', 'Adaptable', 'Easygoing'],
        description: 'You flow between energies with grace — social when needed, quiet when it counts. You\'re harmony itself.',
      },
    };

    return details[archetype];
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