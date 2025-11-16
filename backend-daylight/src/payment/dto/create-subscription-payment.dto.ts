import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSubscriptionPaymentDto {
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