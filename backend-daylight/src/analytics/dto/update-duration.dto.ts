import { IsInt, Min } from 'class-validator';

export class UpdateDurationDto {
  @IsInt()
  @Min(0)
  duration: number;
}