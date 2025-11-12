import { IsArray, IsString, IsOptional, IsEnum, ValidateNested, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsNumber()
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
  @ArrayMinSize(15)
  answers: AnswerDto[];

  @IsOptional()
  @IsEnum(['SINGLE', 'MARRIED', 'PREFER_NOT_SAY'])
  relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  intentOnDaylight?: string[];

  @IsOptional()
  @IsEnum(['TOTALLY_FINE', 'PREFER_SAME_GENDER', 'DEPENDS'])
  genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
}