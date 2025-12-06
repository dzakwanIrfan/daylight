import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
}

export class BulkActionDto {
  @IsArray()
  @ArrayMinSize(1)
  codes: string[];

  @IsEnum(BulkActionType)
  action: BulkActionType;
}