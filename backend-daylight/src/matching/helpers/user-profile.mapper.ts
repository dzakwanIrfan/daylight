import { UserMatchingProfile } from '../types/matching.types';

/**
 * User Profile Mapper
 * Eliminates code duplication for mapping database entities to UserMatchingProfile
 */

/**
 * Maps a transaction with user and personality result to UserMatchingProfile
 */
export function mapTransactionToUserProfile(
    userId: string,
    transactionId: string,
    user: {
        email: string;
        firstName: string | null;
        lastName: string | null;
        personalityResult: {
            energyScore: number;
            opennessScore: number;
            structureScore: number;
            affectScore: number;
            comfortScore: number;
            lifestyleScore: number;
            energyRaw: number;
            opennessRaw: number;
            structureRaw: number;
            affectRaw: number;
            lifestyleRaw: number;
            comfortRaw: number;
            relationshipStatus: string | null;
            genderMixComfort: string | null;
            intentOnDaylight: any;
        } | null;
    },
): UserMatchingProfile {
    const pr = user.personalityResult!;

    return {
        userId,
        transactionId,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        energyScore: pr.energyScore,
        opennessScore: pr.opennessScore,
        structureScore: pr.structureScore,
        affectScore: pr.affectScore,
        comfortScore: pr.comfortScore,
        lifestyleScore: pr.lifestyleScore,
        rawScores: {
            E: pr.energyRaw,
            O: pr.opennessRaw,
            S: pr.structureRaw,
            A: pr.affectRaw,
            L: pr.lifestyleRaw,
            C: pr.comfortRaw,
        },
        relationshipStatus: pr.relationshipStatus,
        genderMixComfort: pr.genderMixComfort,
        intentOnDaylight: (pr.intentOnDaylight as string[]) || [],
    };
}

/**
 * Maps a MatchingMember with user to UserMatchingProfile
 */
export function mapMemberToUserProfile(member: {
    userId: string;
    transactionId: string;
    user: {
        email: string;
        firstName: string | null;
        lastName: string | null;
        personalityResult: {
            energyScore: number;
            opennessScore: number;
            structureScore: number;
            affectScore: number;
            comfortScore: number;
            lifestyleScore: number;
            energyRaw: number;
            opennessRaw: number;
            structureRaw: number;
            affectRaw: number;
            lifestyleRaw: number;
            comfortRaw: number;
            relationshipStatus: string | null;
            genderMixComfort: string | null;
            intentOnDaylight: any;
        } | null;
    };
}): UserMatchingProfile {
    return mapTransactionToUserProfile(
        member.userId,
        member.transactionId,
        member.user,
    );
}
