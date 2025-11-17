import { IsArray, IsEnum, IsBoolean, IsOptional, ArrayMinSize } from 'class-validator';

export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export class BulkActionDto {
  @IsArray()
  @ArrayMinSize(1)
  codes: string[];

  @IsEnum(BulkActionType)
  action: BulkActionType;
}