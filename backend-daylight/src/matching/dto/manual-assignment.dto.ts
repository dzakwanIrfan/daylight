import { IsString, IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

export class AssignUserToGroupDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  transactionId: string;

  @IsInt()
  @Min(1)
  targetGroupNumber: number;

  @IsOptional()
  @IsString()
  note?: string | undefined;
}

export class MoveUserBetweenGroupsDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  fromGroupId: string;

  @IsString()
  @IsUUID()
  toGroupId: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class RemoveUserFromGroupDto {
  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  groupId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateManualGroupDto {
  @IsInt()
  @Min(1)
  groupNumber: number;

  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsString()
  venueName?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkAssignUsersDto {
  @IsString()
  @IsUUID()
  targetGroupId: string;

  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @IsOptional()
  @IsString()
  note?: string;
}