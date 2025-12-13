import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum FeedbackSortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum FeedbackSortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    RATING = 'rating',
}

export class QueryFeedbackAdminDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(FeedbackSortField)
    sortBy?: FeedbackSortField = FeedbackSortField.CREATED_AT;

    @IsOptional()
    @IsEnum(FeedbackSortOrder)
    sortOrder?: FeedbackSortOrder = FeedbackSortOrder.DESC;

    @IsOptional()
    @IsUUID()
    eventId?: string;

    @IsOptional()
    @IsUUID()
    reviewerId?: string;

    @IsOptional()
    @IsUUID()
    targetUserId?: string;

    @IsOptional()
    @IsUUID()
    groupId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    minRating?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    maxRating?: number;
}