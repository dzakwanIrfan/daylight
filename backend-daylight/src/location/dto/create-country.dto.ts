import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'Code must be 2 uppercase letters (ISO 3166-1 alpha-2)' })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}$/, { message: 'Phone code must start with + followed by 1-4 digits' })
  phoneCode: string;
}