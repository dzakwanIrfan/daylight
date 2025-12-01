import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum CountryBulkActionType {
  DELETE = 'delete',
}

export class BulkActionCountryDto {
  @IsArray()
  @ArrayMinSize(1)
  countryIds: string[];

  @IsEnum(CountryBulkActionType)
  action: CountryBulkActionType;
}