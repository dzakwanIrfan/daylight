import { IsArray, IsString, IsOptional, IsEnum, ValidateNested, ArrayMinSize, ArrayMaxSize, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  questionNumber: number;

  @IsString()
  selectedOption: string;
}

export class SubmitPersonalityTestDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @ArrayMinSize(12) 
  @ArrayMaxSize(12)
  answers: AnswerDto[];

  @IsOptional()
  @IsEnum(['SINGLE', 'MARRIED', 'PREFER_NOT_SAY'])
  relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Please select at least one intent' })
  intentOnDaylight?: string[];

  @IsOptional()
  @IsEnum(['TOTALLY_FINE', 'PREFER_SAME_GENDER', 'DEPENDS'])
  genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
}