import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateTransactionDto {
    @IsOptional()
    @IsEnum(TransactionStatus)
    status?: TransactionStatus;

    @IsOptional()
    @IsString()
    notes?: string;
}