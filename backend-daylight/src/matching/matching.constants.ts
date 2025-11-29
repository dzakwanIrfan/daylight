/**
 * Matching Service Constants
 * Centralized configuration for matching algorithm
 */

export const MATCHING_CONSTANTS = {
    // Group size constraints
    MIN_GROUP_SIZE: 3,
    MAX_GROUP_SIZE: 5,

    // Multi-pass thresholds - gradually lower requirements
    THRESHOLDS: [70, 65, 60, 55, 50, 0],

    // Maximum seed attempts per threshold
    MAX_SEED_ATTEMPTS: 10,
} as const;

export type MatchingConstants = typeof MATCHING_CONSTANTS;
