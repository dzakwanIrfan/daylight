import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { EventStatus } from '@prisma/client';

export enum EventBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  PUBLISH = 'publish',
  DRAFT = 'draft',
  CANCEL = 'cancel',
}

export class BulkActionEventDto {
  @IsArray()
  @ArrayMinSize(1)
  eventIds: string[];

  @IsEnum(EventBulkActionType)
  action: EventBulkActionType;
}