import { Injectable } from '@nestjs/common';
import { PersonalityArchetype } from '@prisma/client';
import { TraitScores } from '../types/personality.types';

@Injectable()
export class ArchetypeMatcherService {
    /**
     * Determine personality archetype based on trait scores
     * Following exact algorithm from documentation
     * No changes from original logic - only extracted for modularity
     */
    determineArchetype(scores: TraitScores): PersonalityArchetype {
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

        // Archetype rules (first match wins) - following documentation order

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
}