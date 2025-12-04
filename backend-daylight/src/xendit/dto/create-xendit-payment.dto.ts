import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ItemType {
  EVENT = 'EVENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export class CreateXenditPaymentDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ItemType)
  type: ItemType;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

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
