import { Injectable, BadRequestException } from '@nestjs/common';
import { RelationshipStatus, GenderMixComfort } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContextParserService {
    constructor(private prisma: PrismaService) { }

    /**
     * Parse relationship status string to enum
     */
    parseRelationshipStatus(status?: string): RelationshipStatus | undefined {
        if (!status) return undefined;

        const validStatuses: Record<string, RelationshipStatus> = {
            SINGLE: RelationshipStatus.SINGLE,
            MARRIED: RelationshipStatus.MARRIED,
            PREFER_NOT_SAY: RelationshipStatus.PREFER_NOT_SAY,
        };

        const parsed = validStatuses[status];
        if (!parsed) {
            throw new BadRequestException(`Invalid relationship status: ${status}`);
        }

        return parsed;
    }

    /**
     * Parse gender mix comfort string to enum
     */
    parseGenderMixComfort(comfort?: string): GenderMixComfort | undefined {
        if (!comfort) return undefined;

        const validComforts: Record<string, GenderMixComfort> = {
            TOTALLY_FINE: GenderMixComfort.TOTALLY_FINE,
            PREFER_SAME_GENDER: GenderMixComfort.PREFER_SAME_GENDER,
            DEPENDS: GenderMixComfort.DEPENDS,
        };

        const parsed = validComforts[comfort];
        if (!parsed) {
            throw new BadRequestException(`Invalid gender mix comfort: ${comfort}`);
        }

        return parsed;
    }

    /**
     * Validate city ID
     */
    async validateCityId(cityId?: string): Promise<void> {
        if (!cityId) return;

        const city = await this.prisma.city.findFirst({
            where: {
                id: cityId,
                isActive: true,
            },
        });

        if (!city) {
            throw new BadRequestException('Invalid or inactive city');
        }
    }
}