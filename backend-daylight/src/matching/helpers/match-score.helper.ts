import { MatchScore, UserMatchingProfile } from '../types/matching.types';

/**
 * Match Score Helper Utilities
 * Functions for working with match scores and score maps
 */

/**
 * Builds a score map for quick O(1) lookup
 * Map structure: userId1 -> userId2 -> MatchScore
 */
export function buildScoreMap(
    matchScores: MatchScore[],
): Map<string, Map<string, MatchScore>> {
    const scoreMap = new Map<string, Map<string, MatchScore>>();

    for (const score of matchScores) {
        // Add both directions for easy lookup
        if (!scoreMap.has(score.userId1)) {
            scoreMap.set(score.userId1, new Map());
        }
        if (!scoreMap.has(score.userId2)) {
            scoreMap.set(score.userId2, new Map());
        }

        scoreMap.get(score.userId1)!.set(score.userId2, score);
        scoreMap.get(score.userId2)!.set(score.userId1, score);
    }

    return scoreMap;
}

/**
 * Gets the average match score between a user and group members
 */
export function getAverageScoreWithGroup(
    user: UserMatchingProfile,
    group: UserMatchingProfile[],
    scoreMap: Map<string, Map<string, MatchScore>>,
): number {
    if (group.length === 0) return 0;

    let totalScore = 0;
    let count = 0;

    const userScores = scoreMap.get(user.userId);
    if (!userScores) return 0;

    for (const member of group) {
        const score = userScores.get(member.userId);
        if (score) {
            totalScore += score.score;
            count++;
        }
    }

    return count > 0 ? totalScore / count : 0;
}

/**
 * Gets all pairwise match scores within a group
 */
export function getGroupMatchScores(
    group: UserMatchingProfile[],
    scoreMap: Map<string, Map<string, MatchScore>>,
): MatchScore[] {
    const groupScores: MatchScore[] = [];

    for (let i = 0; i < group.length; i++) {
        const userScores = scoreMap.get(group[i].userId);
        if (!userScores) continue;

        for (let j = i + 1; j < group.length; j++) {
            const score = userScores.get(group[j].userId);
            if (score) {
                groupScores.push(score);
            }
        }
    }

    return groupScores;
}
