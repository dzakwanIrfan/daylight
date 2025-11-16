import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export enum ParticipantSortField {
  PAID_AT = 'paidAt',
  CREATED_AT = 'createdAt',
  CUSTOMER_NAME = 'customerName',
  AMOUNT = 'amount',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryEventParticipantsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ParticipantSortField)
  sortBy?: ParticipantSortField = ParticipantSortField.PAID_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}