import { 
  IsNotEmpty, 
  IsArray, 
  ValidateNested, 
  IsEnum, 
  IsOptional, 
  IsString,
  IsUUID,
  ArrayMinSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationshipStatus, GenderMixComfort } from '@prisma/client';

class AnswerDto {
  @IsNotEmpty({ message: 'Question number is required' })
  questionNumber: number;

  @IsNotEmpty({ message: 'Selected option is required' })
  @IsString()
  selectedOption: string;
}

export class SubmitPersonalityTestDto {
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsString()
  sessionId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one answer is required' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsOptional()
  @IsEnum(RelationshipStatus, { message: 'Invalid relationship status' })
  relationshipStatus?: RelationshipStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  intentOnDaylight?: string[];

  @IsOptional()
  @IsEnum(GenderMixComfort, { message: 'Invalid gender mix comfort level' })
  genderMixComfort?: GenderMixComfort;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid city ID format' })
  currentCityId?: string;
}