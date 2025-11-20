import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum PartnerBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  MARK_PREFERRED = 'mark_preferred',
  UNMARK_PREFERRED = 'unmark_preferred',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class BulkActionPartnerDto {
  @IsArray()
  @ArrayMinSize(1)
  partnerIds: string[];

  @IsEnum(PartnerBulkActionType)
  action: PartnerBulkActionType;
}