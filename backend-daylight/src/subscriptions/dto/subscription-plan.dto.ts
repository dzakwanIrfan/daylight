import { 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsBoolean, 
  Min,
  ValidateNested,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionPlanType } from '@prisma/client';
import { SubscriptionPlanPriceDto } from './subscription-plan-price.dto';

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsEnum(SubscriptionPlanType)
  type: SubscriptionPlanType;

  @IsOptional()
  @IsString()
  description?: string;

  // Keep for backward compatibility
  // If not provided, will use first price from prices array
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  // Multi-currency pricing
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionPlanPriceDto)
  @ArrayMinSize(1, { message: 'At least one price must be provided' })
  prices?: SubscriptionPlanPriceDto[];

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

  // Keep for backward compatibility
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  // NEW: Multi-currency pricing
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionPlanPriceDto)
  prices?: SubscriptionPlanPriceDto[];

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

export class UpdateSubscriptionPlanPriceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}