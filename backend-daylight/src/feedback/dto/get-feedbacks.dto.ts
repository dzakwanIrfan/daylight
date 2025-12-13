import { IsString, IsUUID, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFeedbacksDto {
    @IsString()
    @IsUUID()
    @IsOptional()
    targetUserId?: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    eventId?: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page?: number = 1;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    limit?: number = 10;
}