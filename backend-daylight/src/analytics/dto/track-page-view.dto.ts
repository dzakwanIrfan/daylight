import { IsString, IsOptional, IsObject } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  fingerprint?: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsObject()
  queryParams?: Record<string, string>;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  utmTerm?: string;

  @IsOptional()
  @IsString()
  utmContent?: string;
}