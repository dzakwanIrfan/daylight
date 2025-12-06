import { Injectable } from '@nestjs/common';
import { PersonalityArchetype } from '@prisma/client';
import { ArchetypeDetailService } from '../../archetype-detail/archetype-detail.service';

@Injectable()
export class ResultFormatterService {
    constructor(private archetypeDetailService: ArchetypeDetailService) { }

    /**
     * Format personality result for API response
     */
    async formatResult(result: any) {
        const archetypeDetails = await this.getArchetypeDetails(result.archetype);

        return {
            id: result.id,
            archetype: {
                type: result.archetype,
                ...archetypeDetails,
            },
            scores: {
                profile: result.profileScore,
                energy: result.energyScore,
                openness: result.opennessScore,
                structure: result.structureScore,
                affect: result.affectScore,
                comfort: result.comfortScore,
                lifestyle: result.lifestyleScore,
            },
            rawScores: {
                energy: result.energyRaw,
                openness: result.opennessRaw,
                structure: result.structureRaw,
                affect: result.affectRaw,
                comfort: result.comfortRaw,
                lifestyle: result.lifestyleRaw,
            },
            context: {
                relationshipStatus: result.relationshipStatus,
                intentOnDaylight: result.intentOnDaylight,
                genderMixComfort: result.genderMixComfort,
                currentCityId: result.currentCityId,
            },
            createdAt: result.createdAt,
        };
    }

    /**
     * Get archetype details from database or fallback
     */
    private async getArchetypeDetails(archetype: PersonalityArchetype) {
        try {
            const details = await this.archetypeDetailService.getArchetypeDetailByArchetype(archetype);
            return {
                symbol: details.symbol,
                name: details.name,
                traits: details.traits,
                description: details.description,
                imageKey: details.imageKey,
            };
        } catch (error) {
            // Fallback to default if not found in database
            return {
                symbol: '🌈',
                name: archetype,
                traits: [],
                description: 'No description available',
                imageKey: archetype.toLowerCase().replace(/_/g, '-'),
            };
        }
    }
}