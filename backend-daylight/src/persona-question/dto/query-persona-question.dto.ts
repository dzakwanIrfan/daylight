import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum PersonaQuestionSortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    QUESTION_NUMBER = 'questionNumber',
    PROMPT = 'prompt',
    ORDER = 'order',
}

export class QueryPersonaQuestionDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(PersonaQuestionSortField)
    sortBy?: string;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    order?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;
}