import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExportFormat, ExportType } from './dto/export-analytics.dto';
import * as ExcelJS from 'exceljs';

interface ExportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

@Injectable()
export class AnalyticsExportService {
  private readonly logger = new Logger(AnalyticsExportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Main export function
   */
  async exportAnalytics(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    type: ExportType,
  ): Promise<ExportResult> {
    const dateStr = `${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;

    switch (type) {
      case ExportType.PAGE_VIEWS:
        return this.exportPageViews(startDate, endDate, format, dateStr);
      case ExportType.DAILY_SUMMARY:
        return this.exportDailySummary(startDate, endDate, format, dateStr);
      case ExportType.TOP_PAGES:
        return this.exportTopPages(startDate, endDate, format, dateStr);
      case ExportType.TOP_REFERRERS:
        return this.exportTopReferrers(startDate, endDate, format, dateStr);
      case ExportType.DEVICE_BREAKDOWN:
        return this.exportDeviceBreakdown(startDate, endDate, format, dateStr);
      case ExportType.OVERVIEW:
        return this.exportOverview(startDate, endDate, format, dateStr);
      case ExportType.FULL_REPORT:
      default:
        return this.exportFullReport(startDate, endDate, format, dateStr);
    }
  }

  /**
   * Export page views detail
   */
  private async exportPageViews(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const pageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = pageViews.map((pv) => ({
      'Date/Time': pv.createdAt.toISOString(),
      'Session ID': pv.sessionId,
      'User Email': pv.user?.email || 'Anonymous',
      'User Name': pv.user ? `${pv.user.firstName || ''} ${pv.user.lastName || ''}`.trim() : 'Anonymous',
      'Path': pv.path,
      'Referrer': pv.referrer || 'Direct',
      'Device Type': pv.deviceType,
      'Browser': pv.browser || 'Unknown',
      'OS': pv.os || 'Unknown',
      'Duration (seconds)': pv.duration || 0,
      'UTM Source': pv.utmSource || '',
      'UTM Medium': pv.utmMedium || '',
      'UTM Campaign': pv.utmCampaign || '',
    }));

    return this.generateExport(data, format, `page_views_${dateStr}`);
  }

  /**
   * Export daily summary
   */
  private async exportDailySummary(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const dailyData = await this.prisma.dailyAnalytics.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // If no aggregated data, calculate from page views
    if (dailyData.length === 0) {
      return this.calculateAndExportDailySummary(startDate, endDate, format, dateStr);
    }

    const data = dailyData.map((d) => ({
      'Date': d.date.toISOString().split('T')[0],
      'Total Page Views': d.totalPageViews,
      'Unique Visitors': d.uniqueVisitors,
      'Unique Sessions': d.uniqueSessions,
      'Logged In Visitors': d.loggedInVisitors,
      'Anonymous Visitors': d.anonymousVisitors,
      'Desktop Views': d.desktopViews,
      'Mobile Views': d.mobileViews,
      'Tablet Views': d.tabletViews,
      'Avg Session Duration (s)': Math.round(d.avgSessionDuration),
      'Bounce Rate (%)': d.bounceRate.toFixed(2),
    }));

    return this.generateExport(data, format, `daily_summary_${dateStr}`);
  }

  /**
   * Calculate daily summary from page views if not aggregated
   */
  private async calculateAndExportDailySummary(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const pageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        sessionId: true,
        userId: true,
        deviceType: true,
        duration: true,
        fingerprint: true,
      },
    });

    // Group by date
    const dailyMap = new Map<string, {
      pageViews: number;
      sessions: Set<string>;
      users: Set<string>;
      anonymous: Set<string>;
      desktop: number;
      mobile: number;
      tablet: number;
      durations: number[];
      sessionPages: Map<string, number>;
    }>();

    pageViews.forEach((pv) => {
      const dateKey = pv.createdAt.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          pageViews: 0,
          sessions: new Set(),
          users: new Set(),
          anonymous: new Set(),
          desktop: 0,
          mobile: 0,
          tablet: 0,
          durations: [],
          sessionPages: new Map(),
        });
      }

      const daily = dailyMap.get(dateKey)!;
      daily.pageViews++;
      daily.sessions.add(pv.sessionId);
      
      if (pv.userId) {
        daily.users.add(pv.userId);
      } else if (pv.fingerprint) {
        daily.anonymous.add(pv.fingerprint);
      }

      switch (pv.deviceType) {
        case 'DESKTOP': daily.desktop++; break;
        case 'MOBILE': daily.mobile++; break;
        case 'TABLET': daily.tablet++; break;
      }

      if (pv.duration) {
        daily.durations.push(pv.duration);
      }

      // Track pages per session for bounce rate
      daily.sessionPages.set(
        pv.sessionId,
        (daily.sessionPages.get(pv.sessionId) || 0) + 1
      );
    });

    const data = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => {
        const avgDuration = d.durations.length > 0
          ? d.durations.reduce((a, b) => a + b, 0) / d.durations.length
          : 0;
        
        const bouncedSessions = Array.from(d.sessionPages.values())
          .filter(count => count === 1).length;
        const bounceRate = d.sessions.size > 0
          ? (bouncedSessions / d.sessions.size) * 100
          : 0;

        return {
          'Date': date,
          'Total Page Views': d.pageViews,
          'Unique Visitors': d.users.size + d.anonymous.size,
          'Unique Sessions': d.sessions.size,
          'Logged In Visitors': d.users.size,
          'Anonymous Visitors': d.anonymous.size,
          'Desktop Views': d.desktop,
          'Mobile Views': d.mobile,
          'Tablet Views': d.tablet,
          'Avg Session Duration (s)': Math.round(avgDuration),
          'Bounce Rate (%)': bounceRate.toFixed(2),
        };
      });

    return this.generateExport(data, format, `daily_summary_${dateStr}`);
  }

  /**
   * Export top pages
   */
  private async exportTopPages(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const topPages = await this.prisma.pageView.groupBy({
      by: ['path'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      _avg: {
        duration: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
    });

    // Get unique visitors per page
    const uniqueVisitorsPerPage = await Promise.all(
      topPages.map(async (page) => {
        const unique = await this.prisma.pageView.groupBy({
          by: ['fingerprint'],
          where: {
            path: page.path,
            createdAt: { gte: startDate, lte: endDate },
            fingerprint: { not: null },
          },
          _count: true,
        });
        return { path: page.path, uniqueVisitors: unique.length };
      })
    );

    const uniqueMap = new Map(uniqueVisitorsPerPage.map((u) => [u.path, u.uniqueVisitors]));

    const data = topPages.map((page, index) => ({
      'Rank': index + 1,
      'Page Path': page.path,
      'Total Views': page._count,
      'Unique Visitors': uniqueMap.get(page.path) || 0,
      'Avg Duration (s)': Math.round(page._avg.duration || 0),
    }));

    return this.generateExport(data, format, `top_pages_${dateStr}`);
  }

  /**
   * Export top referrers
   */
  private async exportTopReferrers(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const referrers = await this.prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
    });

    const totalViews = referrers.reduce((sum, r) => sum + r._count, 0);

    const data = referrers.map((ref, index) => ({
      'Rank': index + 1,
      'Referrer': ref.referrer || 'Direct / None',
      'Visits': ref._count,
      'Percentage (%)': ((ref._count / totalViews) * 100).toFixed(2),
    }));

    return this.generateExport(data, format, `top_referrers_${dateStr}`);
  }

  /**
   * Export device breakdown
   */
  private async exportDeviceBreakdown(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const devices = await this.prisma.pageView.groupBy({
      by: ['deviceType'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    const browsers = await this.prisma.pageView.groupBy({
      by: ['browser'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      orderBy: {
        _count: {
          browser: 'desc',
        },
      },
      take: 10,
    });

    const operatingSystems = await this.prisma.pageView.groupBy({
      by: ['os'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      orderBy: {
        _count: {
          os: 'desc',
        },
      },
      take: 10,
    });

    const totalDevices = devices.reduce((sum, d) => sum + d._count, 0);
    const totalBrowsers = browsers.reduce((sum, b) => sum + b._count, 0);
    const totalOS = operatingSystems.reduce((sum, o) => sum + o._count, 0);

    // Combine into one export with sections
    const data = [
      { 'Category': 'DEVICE TYPES', 'Item': '', 'Count': '', 'Percentage': '' },
      ...devices.map((d) => ({
        'Category': '',
        'Item': d.deviceType,
        'Count': d._count,
        'Percentage': ((d._count / totalDevices) * 100).toFixed(2) + '%',
      })),
      { 'Category': '', 'Item': '', 'Count': '', 'Percentage': '' },
      { 'Category': 'TOP BROWSERS', 'Item': '', 'Count': '', 'Percentage': '' },
      ...browsers.map((b) => ({
        'Category': '',
        'Item': b.browser || 'Unknown',
        'Count': b._count,
        'Percentage': ((b._count / totalBrowsers) * 100).toFixed(2) + '%',
      })),
      { 'Category': '', 'Item': '', 'Count': '', 'Percentage': '' },
      { 'Category': 'OPERATING SYSTEMS', 'Item': '', 'Count': '', 'Percentage': '' },
      ...operatingSystems.map((o) => ({
        'Category': '',
        'Item': o.os || 'Unknown',
        'Count': o._count,
        'Percentage': ((o._count / totalOS) * 100).toFixed(2) + '%',
      })),
    ];

    return this.generateExport(data, format, `device_breakdown_${dateStr}`);
  }

  /**
   * Export overview summary
   */
  private async exportOverview(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    const [
      totalPageViews,
      uniqueVisitors,
      uniqueSessions,
      loggedInCount,
      avgDuration,
    ] = await Promise.all([
      this.prisma.pageView.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.pageView.groupBy({
        by: ['fingerprint'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          fingerprint: { not: null },
        },
      }),
      this.prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.pageView.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          userId: { not: null },
        },
      }),
      this.prisma.pageView.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          duration: { not: null },
        },
        _avg: { duration: true },
      }),
    ]);

    // Calculate bounce rate
    const sessionPageCounts = await this.prisma.pageView.groupBy({
      by: ['sessionId'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true,
    });
    const bouncedSessions = sessionPageCounts.filter((s) => s._count === 1).length;
    const bounceRate = uniqueSessions.length > 0
      ? (bouncedSessions / uniqueSessions.length) * 100
      : 0;

    const data = [
      { 'Metric': 'Report Period', 'Value': `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}` },
      { 'Metric': 'Total Page Views', 'Value': totalPageViews },
      { 'Metric': 'Unique Visitors', 'Value': uniqueVisitors.length },
      { 'Metric': 'Unique Sessions', 'Value': uniqueSessions.length },
      { 'Metric': 'Logged In Visitors', 'Value': loggedInCount.length },
      { 'Metric': 'Anonymous Visitors', 'Value': uniqueVisitors.length - loggedInCount.length },
      { 'Metric': 'Average Session Duration', 'Value': `${Math.round(avgDuration._avg.duration || 0)} seconds` },
      { 'Metric': 'Bounce Rate', 'Value': `${bounceRate.toFixed(2)}%` },
      { 'Metric': 'Pages per Session', 'Value': uniqueSessions.length > 0 ? (totalPageViews / uniqueSessions.length).toFixed(2) : '0' },
    ];

    return this.generateExport(data, format, `overview_${dateStr}`);
  }

  /**
   * Export full report with multiple sheets (XLSX) or combined CSV
   */
  private async exportFullReport(
    startDate: Date,
    endDate: Date,
    format: ExportFormat,
    dateStr: string,
  ): Promise<ExportResult> {
    if (format === ExportFormat.XLSX) {
      return this.exportFullReportXLSX(startDate, endDate, dateStr);
    }

    // For CSV, combine all data
    return this.exportFullReportCSV(startDate, endDate, dateStr);
  }

  /**
   * Export full report as XLSX with multiple sheets
   */
  private async exportFullReportXLSX(
    startDate: Date,
    endDate: Date,
    dateStr: string,
  ): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DayLight Analytics';
    workbook.created = new Date();

    // Overview Sheet
    const overviewData = await this.getOverviewData(startDate, endDate);
    const overviewSheet = workbook.addWorksheet('Overview');
    this.addSheetData(overviewSheet, overviewData, 'Overview Summary');

    // Daily Summary Sheet
    const dailySummary = await this.getDailySummaryData(startDate, endDate);
    const dailySheet = workbook.addWorksheet('Daily Summary');
    this.addSheetData(dailySheet, dailySummary, 'Daily Traffic Summary');

    // Top Pages Sheet
    const topPages = await this.getTopPagesData(startDate, endDate);
    const pagesSheet = workbook.addWorksheet('Top Pages');
    this.addSheetData(pagesSheet, topPages, 'Top Pages');

    // Top Referrers Sheet
    const topReferrers = await this.getTopReferrersData(startDate, endDate);
    const referrersSheet = workbook.addWorksheet('Top Referrers');
    this.addSheetData(referrersSheet, topReferrers, 'Top Referrers');

    // Device Breakdown Sheet
    const devices = await this.getDeviceData(startDate, endDate);
    const devicesSheet = workbook.addWorksheet('Devices');
    this.addSheetData(devicesSheet, devices, 'Device & Browser Breakdown');

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      filename: `analytics_full_report_${dateStr}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  /**
   * Export full report as combined CSV
   */
  private async exportFullReportCSV(
    startDate: Date,
    endDate: Date,
    dateStr: string,
  ): Promise<ExportResult> {
    const overviewData = await this.getOverviewData(startDate, endDate);
    const dailySummary = await this.getDailySummaryData(startDate, endDate);
    const topPages = await this.getTopPagesData(startDate, endDate);
    const topReferrers = await this.getTopReferrersData(startDate, endDate);

    // Combine with section headers
    const combinedData = [
      { Section: '=== OVERVIEW SUMMARY ===' },
      ...overviewData,
      { Section: '' },
      { Section: '=== DAILY SUMMARY ===' },
      ...dailySummary,
      { Section: '' },
      { Section: '=== TOP PAGES ===' },
      ...topPages,
      { Section: '' },
      { Section: '=== TOP REFERRERS ===' },
      ...topReferrers,
    ];

    return this.generateExport(combinedData, ExportFormat.CSV, `analytics_full_report_${dateStr}`);
  }

  /**
   * Helper: Get overview data
   */
  private async getOverviewData(startDate: Date, endDate: Date) {
    const [totalPageViews, uniqueVisitors, uniqueSessions, loggedInCount, avgDuration] = 
      await Promise.all([
        this.prisma.pageView.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        this.prisma.pageView.groupBy({
          by: ['fingerprint'],
          where: { createdAt: { gte: startDate, lte: endDate }, fingerprint: { not: null } },
        }),
        this.prisma.pageView.groupBy({
          by: ['sessionId'],
          where: { createdAt: { gte: startDate, lte: endDate } },
        }),
        this.prisma.pageView.groupBy({
          by: ['userId'],
          where: { createdAt: { gte: startDate, lte: endDate }, userId: { not: null } },
        }),
        this.prisma.pageView.aggregate({
          where: { createdAt: { gte: startDate, lte: endDate }, duration: { not: null } },
          _avg: { duration: true },
        }),
      ]);

    return [
      { Metric: 'Report Period', Value: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}` },
      { Metric: 'Total Page Views', Value: totalPageViews },
      { Metric: 'Unique Visitors', Value: uniqueVisitors.length },
      { Metric: 'Unique Sessions', Value: uniqueSessions.length },
      { Metric: 'Logged In Visitors', Value: loggedInCount.length },
      { Metric: 'Anonymous Visitors', Value: uniqueVisitors.length - loggedInCount.length },
      { Metric: 'Avg Session Duration (s)', Value: Math.round(avgDuration._avg.duration || 0) },
    ];
  }

  /**
   * Helper: Get daily summary data
   */
  private async getDailySummaryData(startDate: Date, endDate: Date) {
    const pageViews = await this.prisma.pageView.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, sessionId: true, userId: true, deviceType: true, fingerprint: true },
    });

    const dailyMap = new Map<string, { pageViews: number; sessions: Set<string>; users: Set<string>; anonymous: Set<string> }>();

    pageViews.forEach((pv) => {
      const dateKey = pv.createdAt.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { pageViews: 0, sessions: new Set(), users: new Set(), anonymous: new Set() });
      }
      const daily = dailyMap.get(dateKey)!;
      daily.pageViews++;
      daily.sessions.add(pv.sessionId);
      if (pv.userId) daily.users.add(pv.userId);
      else if (pv.fingerprint) daily.anonymous.add(pv.fingerprint);
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        Date: date,
        'Page Views': d.pageViews,
        'Unique Visitors': d.users.size + d.anonymous.size,
        Sessions: d.sessions.size,
        'Logged In': d.users.size,
        Anonymous: d.anonymous.size,
      }));
  }

  /**
   * Helper: Get top pages data
   */
  private async getTopPagesData(startDate: Date, endDate: Date) {
    const topPages = await this.prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 20,
    });

    return topPages.map((p, i) => ({
      Rank: i + 1,
      Path: p.path,
      Views: p._count,
    }));
  }

  /**
   * Helper: Get top referrers data
   */
  private async getTopReferrersData(startDate: Date, endDate: Date) {
    const referrers = await this.prisma.pageView.groupBy({
      by: ['referrer'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true,
      orderBy: { _count: { referrer: 'desc' } },
      take: 20,
    });

    return referrers.map((r, i) => ({
      Rank: i + 1,
      Referrer: r.referrer || 'Direct / None',
      Visits: r._count,
    }));
  }

  /**
   * Helper: Get device data
   */
  private async getDeviceData(startDate: Date, endDate: Date) {
    const devices = await this.prisma.pageView.groupBy({
      by: ['deviceType'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: true,
    });

    return devices.map((d) => ({
      'Device Type': d.deviceType,
      Count: d._count,
    }));
  }

  /**
   * Helper: Add data to Excel sheet with styling
   */
  private addSheetData(sheet: ExcelJS.Worksheet, data: any[], title: string) {
    // Add title
    sheet.addRow([title]);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([]);

    if (data.length === 0) {
      sheet.addRow(['No data available']);
      return;
    }

    // Add headers
    const headers = Object.keys(data[0]);
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };

    // Add data rows
    data.forEach((row) => {
      sheet.addRow(Object.values(row));
    });

    // Auto-fit columns
    sheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = Math.min(cellLength, 50);
        }
      });
      column.width = maxLength + 2;
    });
  }

  /**
   * Generate export file (CSV or XLSX)
   */
  private async generateExport(
    data: any[],
    format: ExportFormat,
    filename: string,
  ): Promise<ExportResult> {
    if (format === ExportFormat.CSV) {
      return this.generateCSV(data, filename);
    }
    return this.generateXLSX(data, filename);
  }

  /**
   * Generate CSV file
   */
  private generateCSV(data: any[], filename: string): ExportResult {
    if (data.length === 0) {
      return {
        buffer: Buffer.from('No data available'),
        filename: `${filename}.csv`,
        contentType: 'text/csv',
      };
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or newline
          if (value === null || value === undefined) return '';
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        }).join(',')
      ),
    ];

    return {
      buffer: Buffer.from(csvRows.join('\n'), 'utf-8'),
      filename: `${filename}.csv`,
      contentType: 'text/csv',
    };
  }

  /**
   * Generate XLSX file
   */
  private async generateXLSX(data: any[], filename: string): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DayLight Analytics';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Data');
    this.addSheetData(sheet, data, 'Analytics Export');

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      filename: `${filename}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}