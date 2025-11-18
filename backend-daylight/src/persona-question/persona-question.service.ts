import { Injectable } from '@nestjs/common';
import { QueryPersonaQuestionDto } from './dto/query-persona-question.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PersonaQuestionService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async getPersonaQuestionAll(queryDto: QueryPersonaQuestionDto) {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            order,
            isActive,
        } = queryDto;

        const where: Prisma.QuestionWhereInput = {};

        // search
        if (search) {
            where.OR = [
                { prompt: { contains: search, mode: 'insensitive' } },
            ]
        }

        // filters
        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (typeof order === 'number') where.order = order;

        // pagination
        const skip = (page - 1) * limit;
        const take = limit;

        // execute query
        const [personaQuestions, total] = await Promise.all([
            this.prismaService.question.findMany({
                where,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    options: true,
                }
            }),
            this.prismaService.question.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: personaQuestions,
            pagination: {
                total,
                page,
                limit,
                totalPages: totalPages,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
            },
            filters: {
                isActive: isActive,
                order: order,
            },
            sorting: {
                sortBy,
                sortOrder,
            },
        };
    };


}
