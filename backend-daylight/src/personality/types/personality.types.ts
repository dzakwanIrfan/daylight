import { PersonalityArchetype, RelationshipStatus, GenderMixComfort } from '@prisma/client';

export interface AnswerInput {
  questionNumber: number;
  selectedOption: string;
}

export interface TraitScores {
  E: number; // Energy (Extrovert vs Introvert)
  O: number; // Openness (Abstract/Curious vs Practical/Light)
  S: number; // Structure (Flexible vs Structured)
  A: number; // Affect (Feeling vs Thinking)
  C: number; // Comfort with strangers
  L: number; // Lifestyle tier
}

export interface NormalizedScores {
  energyScore: number;
  opennessScore: number;
  structureScore: number;
  affectScore: number;
  comfortScore: number;
  lifestyleScore: number;
}

export interface PersonalityCalculationResult {
  rawScores: TraitScores;
  normalizedScores: NormalizedScores;
  profileScore: number;
  archetype: PersonalityArchetype;
}

export interface ContextData {
  relationshipStatus?: RelationshipStatus;
  intentOnDaylight?: string[];
  genderMixComfort?: GenderMixComfort;
  currentCityId?: string;
}

// Type untuk data yang akan disimpan di Prisma Json field
export type AnswerJson = {
  questionNumber: number;
  selectedOption: string;
}[];

// Trait weight configuration based on updated PDF
export interface TraitWeights {
  E: number; // Energy weight: 25%
  O: number; // Openness weight: 10%
  S: number; // Structure weight: 15%
  A: number; // Affect weight: 20%
  L: number; // Lifestyle weight: 20%
  C: number; // Comfort weight: 10%
}

export const TRAIT_WEIGHTS: TraitWeights = {
  E: 0.25, // 25%
  O: 0.10, // 10%
  S: 0.15, // 15%
  A: 0.20, // 20%
  L: 0.20, // 20%
  C: 0.10, // 10%
};

// Trait score ranges
export interface TraitRange {
  min: number;
  max: number;
}

export const TRAIT_RANGES: Record<keyof TraitScores, TraitRange> = {
  E: { min: -30, max: 30 }, // Sum of all E impacts
  O: { min: -30, max: 30 }, // Sum of all O impacts
  S: { min: -30, max: 30 }, // Sum of all S impacts
  A: { min: -30, max: 30 }, // Sum of all A impacts
  C: { min: 0, max: 20 },   // Comfort score (non-negative)
  L: { min: 1, max: 3 },    // Lifestyle tier (direct value)
};