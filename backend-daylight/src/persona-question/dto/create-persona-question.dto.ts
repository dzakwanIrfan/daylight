import { IsString, IsBoolean, IsInt, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateQuestionOptionDto {
  @IsString()
  optionKey: string;

  @IsString()
  text: string;

  @IsOptional()
  traitImpacts?: any; // JSON
}

export class CreatePersonaQuestionDto {
  @IsInt()
  @Min(1)
  questionNumber: number;

  @IsString()
  section: string;

  @IsString()
  prompt: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsInt()
  @Min(0)
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  options: CreateQuestionOptionDto[];
}