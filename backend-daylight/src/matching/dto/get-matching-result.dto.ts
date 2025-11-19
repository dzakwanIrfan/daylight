import { IsString, IsUUID } from 'class-validator';

export class GetMatchingResultDto {
  @IsString()
  @IsUUID()
  eventId: string;
}