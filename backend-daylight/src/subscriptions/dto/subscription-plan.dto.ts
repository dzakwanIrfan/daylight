import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlanType } from '@prisma/client';
import { CreateSubscriptionPlanPriceDto } from './subscription-plan-price.dto';

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsEnum(SubscriptionPlanType)
  type: SubscriptionPlanType;

  @IsOptional()
  @IsString()
  description?: string;

  // Multi-country pricing (REQUIRED)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionPlanPriceDto)
  @ArrayMinSize(1, { message: 'At least one price must be provided' })
  prices: CreateSubscriptionPlanPriceDto[];

  @IsNumber()
  @Min(1)
  durationInMonths: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationInMonths?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateSubscriptionPlanPricesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubscriptionPlanPriceDto)
  @ArrayMinSize(1, { message: 'At least one price must be provided' })
  prices: CreateSubscriptionPlanPriceDto[];
}
