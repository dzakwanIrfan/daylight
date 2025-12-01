import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsUUID()
  @IsNotEmpty()
  countryId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}