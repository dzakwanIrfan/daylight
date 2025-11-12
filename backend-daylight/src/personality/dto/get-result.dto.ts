import { IsString } from 'class-validator';

export class GetResultDto {
  @IsString()
  sessionId: string;
}