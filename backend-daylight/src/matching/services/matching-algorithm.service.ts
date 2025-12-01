import { Injectable } from '@nestjs/common';
import {
    UserMatchingProfile,
    MatchScore,
    GroupCandidate,
    MatchingResult,
    MatchingStatus,
} from '../types/matching.types';
import { MATCHING_CONSTANTS } from '../matching.constants';
import {
    buildScoreMap,
    getAverageScoreWithGroup,
    getGroupMatchScores,
} from '../helpers/match-score.helper';

/**
 * Matching Algorithm Service
 * Core matching algorithm implementation
 */
@Injectable()
export class MatchingAlgorithmService {
    /**
     * Multi-pass matching strategy
     */
    async multiPassMatching(
        eventId: string,
        participants: UserMatchingProfile[],
        allMatchScores: MatchScore[],
    ): Promise<{
        groups: GroupCandidate[];
        unmatchedUsers: UserMatchingProfile[];
        warnings: string[];
        thresholdBreakdown: Array<{
            threshold: number;
            groupsFormed: number;
            participantsMatched: number;
        }>;
    }> {
        const groups: GroupCandidate[] = [];
        const assigned = new Set<string>();
        const warnings: string[] = [];
        const thresholdBreakdown: Map<
            number,
            { groups: number; participants: number }
        > = new Map();

        // Initialize breakdown tracking
        MATCHING_CONSTANTS.THRESHOLDS.forEach((t) =>
            thresholdBreakdown.set(t, { groups: 0, participants: 0 }),
        );

        // Try each threshold level
        for (const threshold of MATCHING_CONSTANTS.THRESHOLDS) {
            const remainingParticipants = participants.filter(
                (p) => !assigned.has(p.userId),
            );

            if (remainingParticipants.length < MATCHING_CONSTANTS.MIN_GROUP_SIZE) {
                break; // Not enough people left
            }

            // Try multiple seed attempts for this threshold
            const thresholdGroups = await this.formGroupsWithThreshold(
                remainingParticipants,
                allMatchScores,
                threshold,
                assigned,
            );

            if (thresholdGroups.length > 0) {
                groups.push(...thresholdGroups);

                // Track statistics
                const breakdown = thresholdBreakdown.get(threshold)!;
                breakdown.groups += thresholdGroups.length;
                breakdown.participants += thresholdGroups.reduce(
                    (sum, g) => sum + g.size,
                    0,
                );

                // Mark members as assigned
                thresholdGroups.forEach((group) => {
                    group.members.forEach((member) => assigned.add(member.userId));
                });

                warnings.push(
                    `✓ Threshold ${threshold}%: Formed ${thresholdGroups.length} group(s) with ${breakdown.participants} participants`,
                );
            }
        }

        // Identify unmatched users
        const unmatchedUsers = participants.filter((p) => !assigned.has(p.userId));

        if (unmatchedUsers.length > 0) {
            warnings.push(
                `⚠ ${unmatchedUsers.length} participant(s) could not be matched even with minimum threshold`,
            );
        }

        return {
            groups,
            unmatchedUsers,
            warnings,
            thresholdBreakdown: Array.from(thresholdBreakdown.entries())
                .map(([threshold, data]) => ({
                    threshold,
                    groupsFormed: data.groups,
                    participantsMatched: data.participants,
                }))
                .filter((item) => item.groupsFormed > 0),
        };
    }

    /**
     * Form groups with specific threshold using multiple seed attempts
     */
    async formGroupsWithThreshold(
        participants: UserMatchingProfile[],
        allMatchScores: MatchScore[],
        threshold: number,
        globalAssigned: Set<string>,
    ): Promise<GroupCandidate[]> {
        const scoreMap = buildScoreMap(allMatchScores);
        const bestGroups: GroupCandidate[] = [];
        let bestCoverage = 0;

        // Try multiple starting seeds
        for (
            let seedAttempt = 0;
            seedAttempt < MATCHING_CONSTANTS.MAX_SEED_ATTEMPTS;
            seedAttempt++
        ) {
            const localAssigned = new Set<string>(globalAssigned);
            const attemptGroups: GroupCandidate[] = [];

            // Get unassigned participants
            const available = participants.filter((p) => !localAssigned.has(p.userId));

            if (available.length < MATCHING_CONSTANTS.MIN_GROUP_SIZE) {
                break;
            }

            // Start with different seed each attempt
            const seedIndex = seedAttempt % available.length;
            const seedParticipant = available[seedIndex];

            // Try to form group starting from this seed
            const group = this.formSingleGroup(
                seedParticipant,
                available,
                scoreMap,
                threshold,
                localAssigned,
            );

            if (group) {
                attemptGroups.push({ ...group, seedAttempt, thresholdUsed: threshold });
                group.members.forEach((m) => localAssigned.add(m.userId));

                // Continue forming more groups from remaining participants
                let continueForming = true;
                while (continueForming) {
                    const remaining = available.filter((p) => !localAssigned.has(p.userId));

                    if (remaining.length < MATCHING_CONSTANTS.MIN_GROUP_SIZE) {
                        continueForming = false;
                        break;
                    }

                    const nextGroup = this.formSingleGroup(
                        remaining[0],
                        remaining,
                        scoreMap,
                        threshold,
                        localAssigned,
                    );

                    if (nextGroup) {
                        attemptGroups.push({
                            ...nextGroup,
                            seedAttempt,
                            thresholdUsed: threshold,
                        });
                        nextGroup.members.forEach((m) => localAssigned.add(m.userId));
                    } else {
                        continueForming = false;
                    }
                }
            }

            // Track best attempt
            const coverage = attemptGroups.reduce((sum, g) => sum + g.size, 0);
            if (coverage > bestCoverage) {
                bestCoverage = coverage;
                bestGroups.length = 0;
                bestGroups.push(...attemptGroups);
            }

            // If we matched everyone, stop trying
            if (coverage === available.length) {
                break;
            }
        }

        return bestGroups;
    }

    /**
     * Form a single group starting from a seed participant
     */
    formSingleGroup(
        seed: UserMatchingProfile,
        available: UserMatchingProfile[],
        scoreMap: Map<string, Map<string, MatchScore>>,
        threshold: number,
        assigned: Set<string>,
    ): GroupCandidate | null {
        const group: UserMatchingProfile[] = [seed];
        assigned.add(seed.userId);

        // Find best compatible members
        const candidates = available
            .filter((p) => !assigned.has(p.userId))
            .map((p) => {
                const avgScore = getAverageScoreWithGroup(p, group, scoreMap);
                return { user: p, avgScore };
            })
            .filter((c) => c.avgScore >= threshold)
            .sort((a, b) => b.avgScore - a.avgScore);

        // Add members up to MAX_GROUP_SIZE
        for (const candidate of candidates) {
            if (group.length >= MATCHING_CONSTANTS.MAX_GROUP_SIZE) break;

            const avgScore = getAverageScoreWithGroup(
                candidate.user,
                group,
                scoreMap,
            );

            if (avgScore >= threshold) {
                group.push(candidate.user);
                assigned.add(candidate.user.userId);
            }
        }

        // Only return group if it meets minimum size
        if (group.length < MATCHING_CONSTANTS.MIN_GROUP_SIZE) {
            // Unassign members
            group.forEach((m) => assigned.delete(m.userId));
            return null;
        }

        // Calculate group statistics
        const groupScores = getGroupMatchScores(group, scoreMap);
        const avgScore =
            groupScores.reduce((sum, s) => sum + s.score, 0) / groupScores.length;
        const minScore = Math.min(...groupScores.map((s) => s.score));

        return {
            members: group,
            averageMatchScore: Math.round(avgScore * 100) / 100,
            minMatchScore: Math.round(minScore * 100) / 100,
            size: group.length,
            matchScores: groupScores,
            thresholdUsed: threshold,
        };
    }
}
