import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum CitySortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum CitySortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  SLUG = 'slug',
}

export class QueryCityDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CitySortField)
  sortBy?: CitySortField;

  @IsOptional()
  @IsEnum(CitySortOrder)
  sortOrder?: CitySortOrder = CitySortOrder. ASC;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}