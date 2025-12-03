import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsUUID } from 'class-validator';

export class CreateSubscriptionPlanPriceDto {
  @IsUUID()
  countryId: string; // Reference to Country table

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
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

export class SubscriptionPlanPriceResponseDto {
  id: string;
  subscriptionPlanId: string;
  countryId: string;
  amount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  country: {
    id: string;
    code: string;
    name: string;
    currency: string;
  };
}