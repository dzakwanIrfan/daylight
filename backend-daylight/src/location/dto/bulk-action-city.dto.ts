import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum CityBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
}

export class BulkActionCityDto {
  @IsArray()
  @ArrayMinSize(1)
  cityIds: string[];

  @IsEnum(CityBulkActionType)
  action: CityBulkActionType;
}