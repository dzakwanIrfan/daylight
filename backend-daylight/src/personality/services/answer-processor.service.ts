import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AnswerInput, TraitScores } from '../types/personality.types';

@Injectable()
export class AnswerProcessorService {
    constructor(private prisma: PrismaService) { }

    /**
     * Process answers and calculate raw trait scores
     * Accumulates trait impacts from selected options
     */
    async processAnswers(answers: AnswerInput[]): Promise<TraitScores> {
        // Fetch all questions with their options
        const questions = await this.prisma.question.findMany({
            where: { isActive: true },
            include: { options: true },
        });

        // Initialize trait scores
        const traitScores: TraitScores = {
            E: 0,  // Energy: Extrovert(+) ↔ Introvert(-)
            O: 0,  // Openness: Abstract/curious(+) ↔ Practical/light(-)
            S: 0,  // Structure: Flexible/Playful(+) ↔ Structured(-)
            A: 0,  // Affect: Feeling(+) ↔ Thinking(-)
            C: 0,  // Comfort with strangers (0-20 scale)
            L: 0,  // Lifestyle tier (1-3 scale, set directly not accumulated)
        };

        // Process each answer
        for (const answer of answers) {
            const question = questions.find(q => q.questionNumber === answer.questionNumber);

            if (!question) {
                throw new BadRequestException(`Question ${answer.questionNumber} not found`);
            }

            const option = question.options.find(opt => opt.optionKey === answer.selectedOption);

            if (!option) {
                throw new BadRequestException(
                    `Option ${answer.selectedOption} not found for question ${answer.questionNumber}`
                );
            }

            // Apply trait impacts
            const impacts = option.traitImpacts as Prisma.JsonObject;

            for (const [trait, value] of Object.entries(impacts)) {
                if (trait in traitScores && typeof value === 'number') {
                    // For Lifestyle (L), use direct assignment instead of accumulation
                    if (trait === 'L') {
                        traitScores.L = value;
                    } else {
                        traitScores[trait as keyof TraitScores] += value;
                    }
                }
            }
        }

        return traitScores;
    }

    /**
     * Validate that all required questions are answered
     */
    async validateAnswers(answers: AnswerInput[]): Promise<void> {
        const questions = await this.prisma.question.findMany({
            where: { isActive: true },
            select: { questionNumber: true },
        });

        const answeredQuestions = new Set(answers.map(a => a.questionNumber));
        const requiredQuestions = questions.map(q => q.questionNumber);

        const missingQuestions = requiredQuestions.filter(q => !answeredQuestions.has(q));

        if (missingQuestions.length > 0) {
            throw new BadRequestException(
                `Missing answers for questions: ${missingQuestions.join(', ')}`
            );
        }
    }
}