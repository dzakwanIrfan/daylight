import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { PersonalityArchetype } from "@prisma/client";

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class QueryArchetypeDetailDto {
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
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.ASC;

    @IsOptional()
    @IsEnum(PersonalityArchetype)
    archetype?: PersonalityArchetype;
}