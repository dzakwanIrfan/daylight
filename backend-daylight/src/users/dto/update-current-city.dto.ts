import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateCurrentCityDto {
  @IsNotEmpty({ message: 'City ID is required' })
  @IsUUID('4', { message: 'Invalid city ID format' })
  cityId: string;
}