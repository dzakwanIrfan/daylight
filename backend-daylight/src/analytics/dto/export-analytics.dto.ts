import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export enum ExportType {
  OVERVIEW = 'overview',
  PAGE_VIEWS = 'page_views',
  DAILY_SUMMARY = 'daily_summary',
  TOP_PAGES = 'top_pages',
  TOP_REFERRERS = 'top_referrers',
  DEVICE_BREAKDOWN = 'device_breakdown',
  FULL_REPORT = 'full_report',
}

export class ExportAnalyticsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsEnum(ExportType)
  @IsOptional()
  type?: ExportType = ExportType.FULL_REPORT;
}