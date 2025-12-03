import { IsString, IsNumber, IsOptional, IsBoolean, Min, Matches } from 'class-validator';

export class SubscriptionPlanPriceDto {
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a valid 3-letter ISO code (e.g., IDR, USD, SGD)' })
  currency: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Country code must be a valid 2-letter ISO code (e.g., ID, SG, US)' })
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}