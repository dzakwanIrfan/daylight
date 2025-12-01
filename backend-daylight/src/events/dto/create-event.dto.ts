import { 
  IsString, 
  IsEnum, 
  IsDateString, 
  IsNumber, 
  IsOptional, 
  IsBoolean,
  IsArray,
  Min,
  IsUrl,
  MinLength,
  MaxLength,
  IsUUID,
  ValidateIf
} from 'class-validator';
import { EventCategory, EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsDateString()
  eventDate: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  // Required cityId (normalized location)
  @IsUUID()
  cityId: string;

  // partnerId (will auto-fill venue data if provided)
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  // Manual venue input (required if no partnerId)
  @IsOptional()
  @ValidateIf((o) => ! o.partnerId)
  @IsString()
  @MinLength(3)
  venue?: string;

  @IsOptional()
  @ValidateIf((o) => ! o.partnerId)
  @IsString()
  @MinLength(10)
  address?: string;

  // Legacy city string (auto-filled from City relation)
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsUrl()
  googleMapsUrl?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsString()
  organizerName?: string;

  @IsOptional()
  @IsString()
  organizerContact?: string;
}