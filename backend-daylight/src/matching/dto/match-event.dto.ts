import { IsString, IsUUID } from 'class-validator';

export class MatchEventDto {
  @IsString()
  @IsUUID()
  eventId: string;
}