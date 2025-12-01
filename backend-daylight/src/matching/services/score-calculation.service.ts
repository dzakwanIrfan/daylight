import { Injectable } from '@nestjs/common';
import {
    UserMatchingProfile,
    MatchScore,
    PersonalityVector,
} from '../types/matching.types';

/**
 * Score Calculation Service
 * Handles all match score calculations between users
 */
@Injectable()
export class ScoreCalculationService {
    /**
     * Calculate match score between two users
     */
    calculateMatchScore(
        user1: UserMatchingProfile,
        user2: UserMatchingProfile,
    ): MatchScore {
        // 1. Cosine similarity on [E, O, S, A]
        const v1: PersonalityVector = {
            E: user1.rawScores.E,
            O: user1.rawScores.O,
            S: user1.rawScores.S,
            A: user1.rawScores.A,
        };

        const v2: PersonalityVector = {
            E: user2.rawScores.E,
            O: user2.rawScores.O,
            S: user2.rawScores.S,
            A: user2.rawScores.A,
        };

        const cosineSim = this.cosineSimilarity(v1, v2);
        const cosineScore = ((cosineSim + 1) / 2) * 100;

        // 2. Lifestyle bonus (0-20)
        const L_gap = Math.abs(user1.lifestyleScore - user2.lifestyleScore);
        const lifestyleBonus = Math.max(0, 20 - L_gap);

        // 3. Comfort bonus (0-20)
        const C_min = Math.min(user1.comfortScore, user2.comfortScore);
        const comfortBonus = 0.2 * C_min;

        // 4. Final score
        const finalScore =
            0.7 * cosineScore + 0.15 * lifestyleBonus + 0.15 * comfortBonus;

        return {
            userId1: user1.userId,
            userId2: user2.userId,
            score: Math.round(finalScore * 100) / 100,
            breakdown: {
                cosineSimilarity: Math.round(cosineScore * 100) / 100,
                lifestyleBonus: Math.round(lifestyleBonus * 100) / 100,
                comfortBonus: Math.round(comfortBonus * 100) / 100,
            },
        };
    }

    /**
     * Calculate cosine similarity
     */
    cosineSimilarity(v1: PersonalityVector, v2: PersonalityVector): number {
        const dotProduct = v1.E * v2.E + v1.O * v2.O + v1.S * v2.S + v1.A * v2.A;

        const magnitude1 = Math.sqrt(
            v1.E ** 2 + v1.O ** 2 + v1.S ** 2 + v1.A ** 2,
        );

        const magnitude2 = Math.sqrt(
            v2.E ** 2 + v2.O ** 2 + v2.S ** 2 + v2.A ** 2,
        );

        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Calculate all pairwise match scores
     */
    calculateAllMatchScores(
        participants: UserMatchingProfile[],
    ): MatchScore[] {
        const scores: MatchScore[] = [];

        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                const score = this.calculateMatchScore(participants[i], participants[j]);
                scores.push(score);
            }
        }

        scores.sort((a, b) => b.score - a.score);
        return scores;
    }
}
