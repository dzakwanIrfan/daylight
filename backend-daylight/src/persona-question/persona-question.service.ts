import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { QueryPersonaQuestionDto } from './dto/query-persona-question.dto';
import { CreatePersonaQuestionDto } from './dto/create-persona-question.dto';
import { UpdatePersonaQuestionDto } from './dto/update-persona-question.dto';
import { BulkActionPersonaQuestionDto, PersonaQuestionBulkActionType } from './dto/bulk-action-persona-question.dto';
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
            sortBy = 'order',
            sortOrder = 'asc',
            order,
            isActive,
        } = queryDto;

        const where: Prisma.QuestionWhereInput = {};

        // search
        if (search) {
            where.OR = [
                { prompt: { contains: search, mode: 'insensitive' } },
                { section: { contains: search, mode: 'insensitive' } },
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
    }

    async getPersonaQuestionById(id: string) {
        const question = await this.prismaService.question.findUnique({
            where: { id },
            include: {
                options: true,
            },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        return question;
    }

    async createPersonaQuestion(createDto: CreatePersonaQuestionDto) {
        // Check if question number already exists
        const existingQuestion = await this.prismaService.question.findUnique({
            where: { questionNumber: createDto.questionNumber },
        });

        if (existingQuestion) {
            throw new ConflictException('Question number already exists');
        }

        // Create question with options
        const question = await this.prismaService.question.create({
            data: {
                questionNumber: createDto.questionNumber,
                section: createDto.section,
                prompt: createDto.prompt,
                type: createDto.type,
                isActive: createDto.isActive ?? true,
                order: createDto.order,
                options: {
                    create: createDto.options.map(option => ({
                        optionKey: option.optionKey,
                        text: option.text,
                        traitImpacts: option.traitImpacts || {},
                    })),
                },
            },
            include: {
                options: true,
            },
        });

        return {
            message: 'Question created successfully',
            data: question,
        };
    }

    async updatePersonaQuestion(id: string, updateDto: UpdatePersonaQuestionDto) {
        // Check if question exists
        const existingQuestion = await this.prismaService.question.findUnique({
            where: { id },
            include: { options: true },
        });

        if (!existingQuestion) {
            throw new NotFoundException('Question not found');
        }

        // Check if question number is being changed and if it's already taken
        if (updateDto.questionNumber && updateDto.questionNumber !== existingQuestion.questionNumber) {
            const questionNumberTaken = await this.prismaService.question.findUnique({
                where: { questionNumber: updateDto.questionNumber },
            });

            if (questionNumberTaken) {
                throw new ConflictException('Question number already exists');
            }
        }

        // Handle options update
        let optionsUpdate = {};
        if (updateDto.options) {
            // Delete existing options and create new ones
            optionsUpdate = {
                options: {
                    deleteMany: {},
                    create: updateDto.options.map(option => ({
                        optionKey: option.optionKey,
                        text: option.text,
                        traitImpacts: option.traitImpacts || {},
                    })),
                },
            };
        }

        const updatedQuestion = await this.prismaService.question.update({
            where: { id },
            data: {
                questionNumber: updateDto.questionNumber,
                section: updateDto.section,
                prompt: updateDto.prompt,
                type: updateDto.type,
                isActive: updateDto.isActive,
                order: updateDto.order,
                ...optionsUpdate,
            },
            include: {
                options: true,
            },
        });

        return {
            message: 'Question updated successfully',
            data: updatedQuestion,
        };
    }

    async deletePersonaQuestion(id: string) {
        const question = await this.prismaService.question.findUnique({
            where: { id },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        await this.prismaService.question.delete({
            where: { id },
        });

        return {
            message: 'Question deleted successfully',
        };
    }

    async bulkAction(bulkActionDto: BulkActionPersonaQuestionDto) {
        const { questionIds, action } = bulkActionDto;

        // Validate question IDs
        const questions = await this.prismaService.question.findMany({
            where: { id: { in: questionIds } },
            select: { id: true },
        });

        if (questions.length !== questionIds.length) {
            throw new BadRequestException('Some question IDs are invalid');
        }

        let result;

        switch (action) {
            case PersonaQuestionBulkActionType.ACTIVATE:
                result = await this.prismaService.question.updateMany({
                    where: { id: { in: questionIds } },
                    data: { isActive: true },
                });
                break;

            case PersonaQuestionBulkActionType.DEACTIVATE:
                result = await this.prismaService.question.updateMany({
                    where: { id: { in: questionIds } },
                    data: { isActive: false },
                });
                break;

            case PersonaQuestionBulkActionType.DELETE:
                result = await this.prismaService.question.deleteMany({
                    where: { id: { in: questionIds } },
                });
                break;

            default:
                throw new BadRequestException('Invalid bulk action');
        }

        return {
            message: `Bulk action ${action} completed successfully`,
            affectedCount: result.count,
        };
    }

    async exportPersonaQuestions(queryDto: QueryPersonaQuestionDto) {
        const { search, isActive, order } = queryDto;

        const where: Prisma.QuestionWhereInput = {};

        if (search) {
            where.OR = [
                { prompt: { contains: search, mode: 'insensitive' } },
                { section: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (typeof isActive === 'boolean') where.isActive = isActive;
        if (typeof order === 'number') where.order = order;

        const questions = await this.prismaService.question.findMany({
            where,
            include: {
                options: true,
            },
            orderBy: { order: 'asc' },
        });

        return questions;
    }
}