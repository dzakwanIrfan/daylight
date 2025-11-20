import { IsOptional, IsString, IsEnum, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PartnerType, PartnerStatus } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum PartnerSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  TOTAL_EVENTS = 'totalEvents',
  VIEW_COUNT = 'viewCount',
}

export class QueryPartnersDto {
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
  @IsEnum(PartnerSortField)
  sortBy?: PartnerSortField = PartnerSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsEnum(PartnerType)
  type?: PartnerType;

  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPreferred?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  city?: string;
}