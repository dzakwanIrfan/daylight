import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum PartnerImageType {
  LOGO = 'logo',
  COVER = 'cover',
  GALLERY = 'gallery',
}

export class UploadPartnerImageDto {
  @IsString()
  partnerId: string;

  @IsEnum(PartnerImageType)
  imageType: PartnerImageType;

  @IsOptional()
  @IsString()
  description?: string;
}