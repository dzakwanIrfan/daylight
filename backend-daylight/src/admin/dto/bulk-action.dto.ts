import { IsArray, IsEnum, IsBoolean, IsOptional, ArrayMinSize } from 'class-validator';
import { UserRole } from '@prisma/client';

export enum BulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
  UPDATE_ROLE = 'updateRole',
  VERIFY_EMAIL = 'verifyEmail',
}

export class BulkActionDto {
  @IsArray()
  @ArrayMinSize(1)
  userIds: string[];

  @IsEnum(BulkActionType)
  action: BulkActionType;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}