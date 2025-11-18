import { IsString, IsBoolean, IsInt, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateQuestionOptionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  optionKey: string;

  @IsString()
  text: string;

  @IsOptional()
  traitImpacts?: any; // JSON
}

export class UpdatePersonaQuestionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  questionNumber?: number;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionOptionDto)
  options?: UpdateQuestionOptionDto[];
}