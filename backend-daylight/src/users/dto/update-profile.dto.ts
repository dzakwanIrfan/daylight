import { IsString, IsOptional, IsEmail, MinLength, Matches, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @ValidateIf(o => o.phoneNumber !== '' && o.phoneNumber !== null)
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;

  @IsString()
  confirmPassword: string;
}