import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  merchant_ref: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsString()
  @IsNotEmpty()
  payment_method_code: string;

  @IsNumber()
  @IsNotEmpty()
  total_amount: number;

  @IsNumber()
  @IsNotEmpty()
  fee_merchant: number;

  @IsNumber()
  @IsNotEmpty()
  fee_customer: number;

  @IsNumber()
  @IsNotEmpty()
  total_fee: number;

  @IsNumber()
  @IsNotEmpty()
  amount_received: number;

  @IsNumber()
  @IsNotEmpty()
  is_closed_payment: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  paid_at: number;

  @IsString()
  @IsOptional()
  note: string | null;
}