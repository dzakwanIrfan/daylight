import { PersonalityArchetype, RelationshipStatus, GenderMixComfort } from '@prisma/client';

export interface AnswerInput {
  questionNumber: number;
  selectedOption: string;
}

export interface TraitScores {
  E: number; // Energy
  O: number; // Openness
  S: number; // Structure
  A: number; // Affect
  C: number; // Comfort
  L: number; // Lifestyle
}

export interface PersonalityCalculationResult {
  rawScores: TraitScores;
  normalizedScores: {
    energyScore: number;
    opennessScore: number;
    structureScore: number;
    affectScore: number;
    comfortScore: number;
    lifestyleScore: number;
  };
  profileScore: number;
  archetype: PersonalityArchetype;
}

export interface ContextData {
  relationshipStatus?: RelationshipStatus;
  intentOnDaylight?: string[];
  genderMixComfort?: GenderMixComfort;
}

// Type untuk data yang akan disimpan di Prisma Json field
export type AnswerJson = {
  questionNumber: number;
  selectedOption: string;
}[];