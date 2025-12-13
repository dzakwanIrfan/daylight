import { IsString, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class UpdateFeedbackDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

    @IsString()
    @MaxLength(1000)
    @IsOptional()
    review?: string;
}