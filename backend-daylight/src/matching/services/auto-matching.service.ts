import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchingService } from '../matching.service';
import { EmailService } from '../../email/email.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AutoMatchingService {
  private readonly logger = new Logger(AutoMatchingService.name);
  private isProcessing = false; // Prevent concurrent execution

  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Auto-match groups for events starting in 24 hours
   * Runs every hour at minute 0 (e.g., 08:00, 09:00, 10:00)
   */
  @Cron('0 * * * *', {
    timeZone: 'Asia/Jakarta',
  })
  async autoMatchGroups() {
    // Prevent concurrent execution
    if (this.isProcessing) {
      this.logger.warn('Auto-matching job is already running. Skipping...');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting auto-matching job...');

    try {
      // Get current time
      const now = new Date();

      // Calculate the window: events starting in 24-25 hours from now
      const matchWindowStart = new Date(now);
      matchWindowStart.setHours(matchWindowStart.getHours() + 24);

      const matchWindowEnd = new Date(now);
      matchWindowEnd.setHours(matchWindowEnd.getHours() + 25);

      this.logger.log(
        `Finding events between ${matchWindowStart.toISOString()} and ${matchWindowEnd.toISOString()}`,
      );

      // Find all events that need matching WITH FLAGS
      const upcomingEvents = await this.prisma.event.findMany({
        where: {
          startTime: {
            gte: matchWindowStart,
            lt: matchWindowEnd,
          },
          status: 'PUBLISHED',
          isActive: true,
          autoMatchingCompleted: false, 
        },
        include: {
          cityRelation: {
            include: {
              country: true,
            },
          },
        },
      });

      if (upcomingEvents.length === 0) {
        this.logger.log('No events found in the matching window');
        return;
      }

      this.logger.log(
        `Found ${upcomingEvents.length} events that need matching`,
      );

      let totalEventsProcessed = 0;
      let totalGroupsFormed = 0;
      let totalParticipantsMatched = 0;
      let totalEventsFailed = 0;

      // Process each event
      for (const event of upcomingEvents) {
        this.logger.log(`Processing event: ${event.title} (ID: ${event.id})`);

        try {
          // Double-check in transaction to prevent race condition
          const isAlreadyMatched = await this.prisma.event.findUnique({
            where: { 
              id: event.id,
            },
            select: {
              autoMatchingCompleted: true,
            },
          });

          if (isAlreadyMatched?.autoMatchingCompleted) {
            this.logger.log(
              `Event ${event.title} has already been matched. Skipping...`,
            );
            continue;
          }

          // Perform matching
          const matchingResult =
            await this.matchingService.matchEventParticipants(
              event.id,
              'system', // system user ID for auto-matching
            );

          // Save matching results
          await this.matchingService.saveMatchingResults(
            event.id,
            matchingResult,
          );

          // Mark event as auto-matched 
          await this.prisma.event.update({
            where: { id: event.id },
            data: {
              autoMatchingCompleted: true,
              autoMatchingAt: new Date(),
            },
          });

          totalEventsProcessed++;
          totalGroupsFormed += matchingResult.statistics.totalGroups;
          totalParticipantsMatched += matchingResult.statistics.matchedCount;

          this.logger.log(
            `✓ Matched ${matchingResult.statistics.totalGroups} groups for ${event.title}`,
          );

          // Send notifications to matched participants
          if (matchingResult.groups.length > 0) {
            await this.sendMatchedNotifications(event, matchingResult);
          }

          // Send admin notification
          await this.sendAdminNotification(event, matchingResult);
        } catch (error) {
          totalEventsFailed++;
          this.logger.error(
            `Failed to match event ${event.title}: ${error.message}`,
          );
          
          // Optionally: Send error notification to admin
          await this.sendErrorNotificationToAdmin(event, error);
        }
      }

      this.logger.log('========================================');
      this.logger.log('Auto-Matching Job Completed');
      this.logger.log(`Total events processed: ${totalEventsProcessed}`);
      this.logger.log(`Total events failed: ${totalEventsFailed}`);
      this.logger.log(`Total groups formed: ${totalGroupsFormed}`);
      this.logger.log(`Total participants matched: ${totalParticipantsMatched}`);
      this.logger.log('========================================');
    } catch (error) {
      this.logger.error('Error in auto-matching job:', error);
      throw error;
    } finally {
      this.isProcessing = false; // Release lock
    }
  }

  /**
   * Send notifications to matched participants
   */
  private async sendMatchedNotifications(event: any, matchingResult: any) {
    const processedUsers = new Set<string>();

    for (const group of matchingResult.groups) {
      for (const member of group.members) {
        // Skip if already processed
        if (processedUsers.has(member.userId)) {
          this.logger.warn(`User ${member.userId} already notified. Skipping...`);
          continue;
        }

        try {
          // Get user details
          const user = await this.prisma.user.findUnique({
            where: { id: member.userId },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          });

          if (!user) continue;

          const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Participant';

          // Create in-app notification
          await this.notificationsService.createNotification({
            userId: user.id,
            type: NotificationType.GROUP_MATCHED,
            title: 'You\'ve Been Matched!',
            message: `Great news! You've been matched to a group for ${event.title}. Check your email for details.`,
            referenceId: event.id,
            referenceType: 'event',
            metadata: {
              eventId: event.id,
              eventTitle: event.title,
              groupNumber: matchingResult.groups.findIndex((g: any) => 
                g.members.some((m: any) => m.userId === user.id)
              ) + 1,
            },
          });

          // Send email notification
          await this.emailService.sendGroupMatchedEmail(
            user,
            event,
            group,
            member,
          );

          processedUsers.add(member.userId);
          this.logger.log(`✓ Sent notifications to ${user.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to send notification to user ${member.userId}: ${error.message}`,
          );
        }
      }
    }
  }

  /**
   * Send notification to admin
   */
  private async sendAdminNotification(event: any, matchingResult: any) {
    try {
      await this.emailService.sendMatchingCompleteToAdmin(
        event,
        matchingResult,
      );
      this.logger.log('✓ Sent matching completion notification to admin');
    } catch (error) {
      this.logger.error(
        `Failed to send admin notification: ${error.message}`,
      );
    }
  }

  /**
   * Send error notification to admin
   */
  private async sendErrorNotificationToAdmin(event: any, error: any) {
    try {
      const adminEmail = this.emailService['configService'].get('ADMIN_EMAIL') || 'contact@himgroup.asia';
      
      await this.emailService['transporter'].sendMail({
        from: this.emailService['configService'].get('EMAIL_FROM'),
        to: adminEmail,
        subject: `[DayLight] Auto-Matching Failed - ${event.title}`,
        html: `
          <h2>Auto-Matching Error</h2>
          <p>Failed to perform auto-matching for event: <strong>${event.title}</strong></p>
          <p><strong>Event ID:</strong> ${event.id}</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p>Please check the logs and manually match this event if needed.</p>
        `,
      });

      this.logger.log('✓ Sent error notification to admin');
    } catch (err) {
      this.logger.error(`Failed to send error notification: ${err.message}`);
    }
  }

  /**
   * Manual trigger for testing or retry
   */
  async manualTrigger(eventId?: string) {
    this.logger.log('Manual trigger initiated...');
    
    if (eventId) {
      // Trigger for specific event
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          cityRelation: {
            include: {
              country: true,
            },
          },
        },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // Reset flag if needed
      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          autoMatchingCompleted: false,
          autoMatchingAt: null,
        },
      });

      // Process single event
      const matchingResult = await this.matchingService.matchEventParticipants(
        event.id,
        'manual',
      );

      await this.matchingService.saveMatchingResults(event.id, matchingResult);

      await this.prisma.event.update({
        where: { id: eventId },
        data: {
          autoMatchingCompleted: true,
          autoMatchingAt: new Date(),
        },
      });

      if (matchingResult.groups.length > 0) {
        await this.sendMatchedNotifications(event, matchingResult);
      }

      await this.sendAdminNotification(event, matchingResult);

      return {
        message: 'Manual matching completed',
        result: matchingResult,
      };
    } else {
      // Run full cron job
      await this.autoMatchGroups();
      return { message: 'Manual trigger completed' };
    }
  }

  /**
   * Reset auto-matching flag for an event (admin utility)
   */
  async resetAutoMatchingFlag(eventId: string) {
    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        autoMatchingCompleted: false,
        autoMatchingAt: null,
      },
    });

    this.logger.log(`Reset auto-matching flag for event: ${event.title}`);
    return event;
  }
}