import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class TypingDto {
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsBoolean()
  isTyping: boolean;
}