import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;
}

export class CancelSubscriptionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}