import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegisterFreeEventDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;
}