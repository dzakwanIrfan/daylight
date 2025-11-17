import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Get current date ranges
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total users
    const totalUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    // Users this month
    const usersThisMonth = await this.prisma.user.count({
      where: {
        isActive: true,
        createdAt: { gte: startOfCurrentMonth },
      },
    });

    // Users last month
    const usersLastMonth = await this.prisma.user.count({
      where: {
        isActive: true,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Active events (published and not completed/cancelled)
    const activeEvents = await this.prisma.event.count({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        eventDate: { gte: now },
      },
    });

    // Events this month
    const eventsThisMonth = await this.prisma.event.count({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        createdAt: { gte: startOfCurrentMonth },
      },
    });

    // Events last month
    const eventsLastMonth = await this.prisma.event.count({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Active subscriptions
    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now },
      },
    });

    // Subscriptions this month
    const subscriptionsThisMonth = await this.prisma.userSubscription.count({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: startOfCurrentMonth },
      },
    });

    // Subscriptions last month
    const subscriptionsLastMonth = await this.prisma.userSubscription.count({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalUsers,
      activeEvents,
      activeSubscriptions,
      growth: {
        users: calculateGrowth(usersThisMonth, usersLastMonth),
        events: calculateGrowth(eventsThisMonth, eventsLastMonth),
        subscriptions: calculateGrowth(
          subscriptionsThisMonth,
          subscriptionsLastMonth,
        ),
      },
    };
  }

  async getRecentUsers(limit: number = 4) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    return users;
  }

  async getUpcomingEvents(limit: number = 4) {
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        isActive: true,
        eventDate: { gte: now },
      },
      orderBy: [{ eventDate: 'asc' }, { startTime: 'asc' }],
      take: limit,
      select: {
        id: true,
        title: true,
        eventDate: true,
        startTime: true,
        category: true,
        currentParticipants: true,
        maxParticipants: true,
      },
    });

    return events;
  }
}