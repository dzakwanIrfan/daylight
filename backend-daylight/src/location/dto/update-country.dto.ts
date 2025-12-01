import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'Code must be 2 uppercase letters (ISO 3166-1 alpha-2)' })
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,4}$/, { message: 'Phone code must start with + followed by 1-4 digits' })
  phoneCode?: string;
}