import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { DeviceType } from '@prisma/client';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Hash IP address for privacy
   */
  private hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }

  /**
   * Parse user agent to extract device info
   */
  private parseUserAgent(userAgent: string): {
    deviceType: DeviceType;
    browser: string;
    os: string;
  } {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType: DeviceType = DeviceType.UNKNOWN;
    const device = result.device.type;

    if (device === 'mobile') {
      deviceType = DeviceType.MOBILE;
    } else if (device === 'tablet') {
      deviceType = DeviceType.TABLET;
    } else if (!device || device === 'desktop') {
      deviceType = DeviceType.DESKTOP;
    }

    return {
      deviceType,
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
    };
  }

  /**
   * Track a page view
   */
  async trackPageView(
    dto: TrackPageViewDto,
    userAgent: string,
    ip: string,
    userId?: string,
  ) {
    try {
      const { deviceType, browser, os } = this.parseUserAgent(userAgent);
      const hashedIp = this.hashIp(ip);

      const pageView = await this.prisma.pageView.create({
        data: {
          sessionId: dto.sessionId,
          fingerprint: dto.fingerprint,
          userId: userId || null,
          path: dto.path,
          referrer: dto.referrer,
          queryParams: dto.queryParams,
          userAgent,
          deviceType,
          browser,
          os,
          ip: hashedIp,
          utmSource: dto.utmSource,
          utmMedium: dto.utmMedium,
          utmCampaign: dto.utmCampaign,
          utmTerm: dto.utmTerm,
          utmContent: dto.utmContent,
        },
      });

      return { success: true, id: pageView.id };
    } catch (error) {
      this.logger.error('Failed to track page view:', error);
      return { success: false };
    }
  }

  /**
   * Update page view duration when user leaves
   */
  async updatePageViewDuration(pageViewId: string, duration: number) {
    try {
      await this.prisma.pageView.update({
        where: { id: pageViewId },
        data: {
          duration,
          exitedAt: new Date(),
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to update page view duration:', error);
      return { success: false };
    }
  }

  /**
   * Get analytics overview for admin dashboard
   */
  async getAnalyticsOverview(startDate: Date, endDate: Date) {
    const [
      totalPageViews,
      uniqueVisitors,
      uniqueSessions,
      loggedInCount,
      deviceBreakdown,
      topPages,
      topReferrers,
      avgDuration,
    ] = await Promise.all([
      // Total page views
      this.prisma.pageView.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Unique visitors (by fingerprint or sessionId)
      this.prisma.pageView.groupBy({
        by: ['fingerprint'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          fingerprint: { not: null },
        },
        _count: true,
      }),

      // Unique sessions
      this.prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),

      // Logged in visitors
      this.prisma.pageView.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          userId: { not: null },
        },
        _count: true,
      }),

      // Device breakdown
      this.prisma.pageView.groupBy({
        by: ['deviceType'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),

      // Top pages
      this.prisma.pageView.groupBy({
        by: ['path'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
        orderBy: {
          _count: {
            path: 'desc',
          },
        },
        take: 10,
      }),

      // Top referrers
      this.prisma.pageView.groupBy({
        by: ['referrer'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          referrer: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            referrer: 'desc',
          },
        },
        take: 10,
      }),

      // Average duration
      this.prisma.pageView.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          duration: { not: null },
        },
        _avg: {
          duration: true,
        },
      }),
    ]);

    // Calculate bounce rate (sessions with only 1 page view)
    const sessionPageCounts = await this.prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    const bouncedSessions = sessionPageCounts.filter((s) => s._count === 1).length;
    const bounceRate = uniqueSessions.length > 0 
      ? (bouncedSessions / uniqueSessions.length) * 100 
      : 0;

    return {
      totalPageViews,
      uniqueVisitors: uniqueVisitors.length,
      uniqueSessions: uniqueSessions.length,
      loggedInVisitors: loggedInCount.length,
      anonymousVisitors: uniqueVisitors.length - loggedInCount.length,
      deviceBreakdown: deviceBreakdown.reduce((acc, item) => {
        acc[item.deviceType.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>),
      topPages: topPages.map((p) => ({
        path: p.path,
        views: p._count,
      })),
      topReferrers: topReferrers
        .filter((r) => r.referrer)
        .map((r) => ({
          referrer: r.referrer,
          count: r._count,
        })),
      avgSessionDuration: avgDuration._avg.duration || 0,
      bounceRate: Math.round(bounceRate * 100) / 100,
    };
  }

  /**
   * Get page views over time for charts
   */
  async getPageViewsOverTime(startDate: Date, endDate: Date, granularity: 'hour' | 'day' | 'week' = 'day') {
    const pageViews = await this.prisma.pageView.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        userId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by time period
    const grouped = new Map<string, { total: number; loggedIn: number; anonymous: number }>();

    pageViews.forEach((pv) => {
      let key: string;
      const date = new Date(pv.createdAt);

      if (granularity === 'hour') {
        key = `${date.toISOString().split('T')[0]}T${date.getHours().toString().padStart(2, '0')}:00`;
      } else if (granularity === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!grouped.has(key)) {
        grouped.set(key, { total: 0, loggedIn: 0, anonymous: 0 });
      }

      const current = grouped.get(key)!;
      current.total++;
      if (pv.userId) {
        current.loggedIn++;
      } else {
        current.anonymous++;
      }
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  /**
   * Get real-time active users (last 5 minutes)
   */
  async getRealtimeUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await this.prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: { gte: fiveMinutesAgo },
      },
      _count: true,
    });

    const activeLoggedIn = await this.prisma.pageView.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: fiveMinutesAgo },
        userId: { not: null },
      },
      _count: true,
    });

    // Get current pages being viewed
    const currentPages = await this.prisma.pageView.groupBy({
      by: ['path'],
      where: {
        createdAt: { gte: fiveMinutesAgo },
      },
      _count: true,
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 5,
    });

    return {
      activeSessions: activeUsers.length,
      loggedInUsers: activeLoggedIn.length,
      anonymousUsers: activeUsers.length - activeLoggedIn.length,
      currentPages: currentPages.map((p) => ({
        path: p.path,
        users: p._count,
      })),
    };
  }

  /**
   * Aggregate daily analytics (run at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyAnalytics() {
    this.logger.log('Starting daily analytics aggregation...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    try {
      const analytics = await this.getAnalyticsOverview(yesterday, endOfYesterday);

      await this.prisma.dailyAnalytics.upsert({
        where: { date: yesterday },
        create: {
          date: yesterday,
          totalPageViews: analytics.totalPageViews,
          uniqueVisitors: analytics.uniqueVisitors,
          uniqueSessions: analytics.uniqueSessions,
          loggedInVisitors: analytics.loggedInVisitors,
          anonymousVisitors: analytics.anonymousVisitors,
          desktopViews: analytics.deviceBreakdown.desktop || 0,
          mobileViews: analytics.deviceBreakdown.mobile || 0,
          tabletViews: analytics.deviceBreakdown.tablet || 0,
          topPages: analytics.topPages,
          topReferrers: analytics.topReferrers,
          avgSessionDuration: analytics.avgSessionDuration,
          bounceRate: analytics.bounceRate,
        },
        update: {
          totalPageViews: analytics.totalPageViews,
          uniqueVisitors: analytics.uniqueVisitors,
          uniqueSessions: analytics.uniqueSessions,
          loggedInVisitors: analytics.loggedInVisitors,
          anonymousVisitors: analytics.anonymousVisitors,
          desktopViews: analytics.deviceBreakdown.desktop || 0,
          mobileViews: analytics.deviceBreakdown.mobile || 0,
          tabletViews: analytics.deviceBreakdown.tablet || 0,
          topPages: analytics.topPages,
          topReferrers: analytics.topReferrers,
          avgSessionDuration: analytics.avgSessionDuration,
          bounceRate: analytics.bounceRate,
        },
      });

      this.logger.log('Daily analytics aggregation completed');
    } catch (error) {
      this.logger.error('Failed to aggregate daily analytics:', error);
    }
  }

  /**
   * Clean up old page views (keep last 90 days detail, aggregated data forever)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldPageViews() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
      const result = await this.prisma.pageView.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old page views`);
    } catch (error) {
      this.logger.error('Failed to cleanup old page views:', error);
    }
  }

  /**
   * Get historical analytics from aggregated data
   */
  async getHistoricalAnalytics(startDate: Date, endDate: Date) {
    return this.prisma.dailyAnalytics.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}