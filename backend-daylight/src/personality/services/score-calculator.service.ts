import { Injectable } from '@nestjs/common';
import {
    TraitScores,
    NormalizedScores,
    TRAIT_WEIGHTS,
    TRAIT_RANGES,
} from '../types/personality.types';

@Injectable()
export class ScoreCalculatorService {
    /**
     * Clamp trait scores to their valid ranges
     */
    clampTraitScores(scores: TraitScores): TraitScores {
        return {
            E: this.clamp(scores.E, TRAIT_RANGES.E.min, TRAIT_RANGES.E.max),
            O: this.clamp(scores.O, TRAIT_RANGES.O.min, TRAIT_RANGES.O.max),
            S: this.clamp(scores.S, TRAIT_RANGES.S.min, TRAIT_RANGES.S.max),
            A: this.clamp(scores.A, TRAIT_RANGES.A.min, TRAIT_RANGES.A.max),
            C: this.clamp(scores.C, TRAIT_RANGES.C.min, TRAIT_RANGES.C.max),
            L: this.clamp(scores.L, TRAIT_RANGES.L.min, TRAIT_RANGES.L.max),
        };
    }

    /**
     * Normalize raw trait scores to 0-100 scale
     * Based on updated formula from PDF
     */
    normalizeScores(rawScores: TraitScores): NormalizedScores {
        // E, O, S, A: Normalize from [-30, 30] to [0, 100]
        const energyScore = ((rawScores.E - TRAIT_RANGES.E.min) / (TRAIT_RANGES.E.max - TRAIT_RANGES.E.min)) * 100;
        const opennessScore = ((rawScores.O - TRAIT_RANGES.O.min) / (TRAIT_RANGES.O.max - TRAIT_RANGES.O.min)) * 100;
        const structureScore = ((rawScores.S - TRAIT_RANGES.S.min) / (TRAIT_RANGES.S.max - TRAIT_RANGES.S.min)) * 100;
        const affectScore = ((rawScores.A - TRAIT_RANGES.A.min) / (TRAIT_RANGES.A.max - TRAIT_RANGES.A.min)) * 100;

        // C: Normalize from [0, 20] to [0, 100]
        const comfortScore = (rawScores.C / TRAIT_RANGES.C.max) * 100;

        // L: Normalize from [1, 3] to [0, 100]
        const lifestyleScore = ((rawScores.L - TRAIT_RANGES.L.min) / (TRAIT_RANGES.L.max - TRAIT_RANGES.L.min)) * 100;

        return {
            energyScore: this.roundToTwoDecimals(energyScore),
            opennessScore: this.roundToTwoDecimals(opennessScore),
            structureScore: this.roundToTwoDecimals(structureScore),
            affectScore: this.roundToTwoDecimals(affectScore),
            comfortScore: this.roundToTwoDecimals(comfortScore),
            lifestyleScore: this.roundToTwoDecimals(lifestyleScore),
        };
    }

    /**
     * Calculate weighted profile score
     * Based on updated weights from PDF:
     * - Energy (E): 25%
     * - Openness (O): 10%
     * - Structure (S): 15%
     * - Affect (A): 20%
     * - Lifestyle (L): 20%
     * - Comfort (C): 10%
     */
    calculateProfileScore(normalizedScores: NormalizedScores): number {
        const weightedScore =
            TRAIT_WEIGHTS.E * normalizedScores.energyScore +
            TRAIT_WEIGHTS.O * normalizedScores.opennessScore +
            TRAIT_WEIGHTS.S * normalizedScores.structureScore +
            TRAIT_WEIGHTS.A * normalizedScores.affectScore +
            TRAIT_WEIGHTS.L * normalizedScores.lifestyleScore +
            TRAIT_WEIGHTS.C * normalizedScores.comfortScore;

        return this.roundToTwoDecimals(weightedScore);
    }

    /**
     * Utility: Clamp value between min and max
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Utility: Round to 2 decimal places
     */
    private roundToTwoDecimals(value: number): number {
        return Math.round(value * 100) / 100;
    }
}