import { IsString, IsUUID, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
    @IsString()
    @IsUUID()
    targetUserId: string;

    @IsString()
    @IsUUID()
    eventId: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    groupId?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @MaxLength(1000)
    review: string;
}