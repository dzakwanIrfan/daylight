export interface PersonalityVector {
  E: number; // -10 to +10
  O: number;
  S: number;
  A: number;
}

export interface UserMatchingProfile {
  userId: string;
  transactionId: string;
  email: string;
  name: string;
  
  // Personality traits (normalized 0-100)
  energyScore: number;
  opennessScore: number;
  structureScore: number;
  affectScore: number;
  comfortScore: number;
  lifestyleScore: number;
  
  // Raw scores for cosine similarity
  rawScores: {
    E: number;
    O: number;
    S: number;
    A: number;
    L: number;
    C: number;
  };
  
  // Context
  relationshipStatus: string | null;
  genderMixComfort: string | null;
  intentOnDaylight: string[];
}

export interface MatchScore {
  userId1: string;
  userId2: string;
  score: number; // 0-100
  breakdown: {
    cosineSimilarity: number;
    lifestyleBonus: number;
    comfortBonus: number;
  };
}

export interface GroupCandidate {
  members: UserMatchingProfile[];
  averageMatchScore: number;
  minMatchScore: number;
  size: number;
  matchScores: MatchScore[];
  thresholdUsed: number; // NEW: Track which threshold worked
  seedAttempt?: number;  // NEW: Which seed attempt formed this group
}

export interface MatchingResult {
  eventId: string;
  totalParticipants: number;
  groups: GroupCandidate[];
  unmatchedUsers: UserMatchingProfile[];
  statistics: {
    averageGroupSize: number;
    averageMatchScore: number;
    totalGroups: number;
    matchedCount: number;
    unmatchedCount: number;
    highestThreshold: number;
    lowestThreshold: number;
  };
  thresholdBreakdown: {
    threshold: number;
    groupsFormed: number;
    participantsMatched: number;
  }[];
  warnings: string[]; // NEW: List of warnings/issues
}

export enum MatchingStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  PARTIALLY_MATCHED = 'PARTIALLY_MATCHED',
  NO_MATCH = 'NO_MATCH',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}