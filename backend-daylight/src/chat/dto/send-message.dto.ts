import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(5000, { message: 'Message cannot exceed 5000 characters' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: 'Group ID is required' })
  groupId: string;
}