import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsBoolean,
  IsArray,
  IsUrl,
  IsEmail,
  IsNumber,
  MinLength,
  MaxLength,
  IsJSON
} from 'class-validator';
import { PartnerType, PartnerStatus } from '@prisma/client';

export class CreatePartnerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsEnum(PartnerType)
  type: PartnerType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsString()
  @MinLength(10)
  address: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  googleMapsUrl?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsJSON()
  operatingHours?: any;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}