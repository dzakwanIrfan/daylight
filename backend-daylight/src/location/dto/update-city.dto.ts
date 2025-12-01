import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}