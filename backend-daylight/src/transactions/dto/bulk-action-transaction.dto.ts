import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum TransactionBulkActionType {
  MARK_PAID = 'mark_paid',
  MARK_FAILED = 'mark_failed',
  MARK_EXPIRED = 'mark_expired',
  REFUND = 'refund',
  DELETE = 'delete',
}

export class BulkActionTransactionDto {
  @IsArray()
  @ArrayMinSize(1)
  transactionIds: string[];

  @IsEnum(TransactionBulkActionType)
  action: TransactionBulkActionType;
}