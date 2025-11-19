export interface PersonalitySnapshot {
  energyScore: number;
  opennessScore: number;
  structureScore: number;
  affectScore: number;
  comfortScore: number;
  lifestyleScore: number;
  rawScores: {
    E: number;
    O: number;
    S: number;
    A: number;
    L: number;
    C: number;
  };
}

export interface MatchingMember {
  id: string;
  userId: string;
  isYou?: boolean;
  user: {
    email: string;
    name: string;
    profilePicture: string | null;
    archetype: string | null;
    profileScore: number | null;
  };
  matchScores: Record<string, number>;
  personalitySnapshot: PersonalitySnapshot;
  isConfirmed: boolean;
}

export enum MatchingStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  PARTIALLY_MATCHED = 'PARTIALLY_MATCHED',
  NO_MATCH = 'NO_MATCH',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface MatchingGroup {
  id: string;
  groupNumber: number;
  status: MatchingStatus;
  averageMatchScore: number;
  minMatchScore: number;
  groupSize: number;
  thresholdUsed: number;
  tableNumber: string | null;
  venueName: string | null;
  members: MatchingMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ThresholdBreakdown {
  threshold: number;
  groupsFormed: number;
  participantsMatched: number;
}

export interface MatchingStatistics {
  averageGroupSize: number;
  averageMatchScore: number;
  totalGroups: number;
  matchedCount: number;
  unmatchedCount: number;
  highestThreshold: number;
  lowestThreshold: number;
}

export interface MatchingResultResponse {
  eventId: string;
  totalGroups: number;
  groups: MatchingGroup[];
}

export interface MatchingPreviewResponse {
  message: string;
  result: {
    eventId: string;
    totalParticipants: number;
    groups: {
      members: {
        userId: string;
        email: string;
        name: string;
      }[];
      averageMatchScore: number;
      minMatchScore: number;
      size: number;
      thresholdUsed: number;
      seedAttempt: number;
    }[];
    unmatchedUsers: {
      userId: string;
      email: string;
      name: string;
    }[];
    statistics: MatchingStatistics;
    thresholdBreakdown: ThresholdBreakdown[];
    warnings: string[];
  };
}

export interface MatchingAttempt {
  id: string;
  attemptNumber: number;
  status: MatchingStatus;
  totalParticipants: number;
  matchedCount: number;
  unmatchedCount: number;
  groupsFormed: number;
  averageMatchScore: number | null;
  highestThreshold: number;
  lowestThreshold: number;
  executionTime: number;
  createdAt: string;
}