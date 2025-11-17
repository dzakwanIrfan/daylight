import { IsOptional, IsString, IsBoolean, IsNumber, Min, IsEnum } from 'class-validator';
import { PaymentChannelType } from '@prisma/client';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsEnum(PaymentChannelType)
  type?: PaymentChannelType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeMerchantFlat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeMerchantPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeCustomerFlat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeCustomerPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumAmount?: number;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}