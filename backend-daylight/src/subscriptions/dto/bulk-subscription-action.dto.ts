import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum BulkSubscriptionActionType {
  CANCEL = 'cancel',
  ACTIVATE = 'activate',
}

export class BulkSubscriptionActionDto {
  @IsArray()
  @ArrayMinSize(1)
  subscriptionIds: string[];

  @IsEnum(BulkSubscriptionActionType)
  action: BulkSubscriptionActionType;
}