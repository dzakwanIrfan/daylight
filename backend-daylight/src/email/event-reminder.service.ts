import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { PaymentStatus, TransactionType } from '@prisma/client';

@Injectable()
export class EventReminderService {
  private readonly logger = new Logger(EventReminderService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  /**
   * Send H-1 event reminders (24 hours before event)
   * Runs every hour at minute 0 (e.g., 08:00, 09:00, 10:00)
   * Only sends reminder ONCE per transaction
   */
  @Cron('0 * * * *', {
    timeZone: 'Asia/Jakarta',
  })
  async sendTomorrowEventReminders() {
    this.logger.log('Starting H-1 event reminder job...');

    try {
      // Get current time in Jakarta timezone
      const now = new Date();

      // Calculate the window: events happening in 24-25 hours from now
      // This ensures we catch events exactly 24 hours before
      const reminderWindowStart = new Date(now);
      reminderWindowStart.setHours(reminderWindowStart.getHours() + 24);

      const reminderWindowEnd = new Date(now);
      reminderWindowEnd.setHours(reminderWindowEnd.getHours() + 25);

      this.logger.log(
        `📅 Finding events between ${reminderWindowStart.toISOString()} and ${reminderWindowEnd.toISOString()}`,
      );

      // Find all events happening within the reminder window (24-25 hours from now)
      const upcomingEvents = await this.prisma.event.findMany({
        where: {
          startTime: {
            gte: reminderWindowStart,
            lt: reminderWindowEnd,
          },
          status: 'PUBLISHED',
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          eventDate: true,
          startTime: true,
          endTime: true,
          venue: true,
          address: true,
          city: true,
          googleMapsUrl: true,
          requirements: true,
        },
      });

      if (upcomingEvents.length === 0) {
        this.logger.log('No events found in the reminder window');
        return;
      }

      this.logger.log(`Found ${upcomingEvents.length} events in reminder window`);

      let totalParticipants = 0;
      let totalEmailsSent = 0;
      let totalEmailsFailed = 0;
      let totalSkipped = 0;

      // Process each event
      for (const event of upcomingEvents) {
        this.logger.log(`Processing event: ${event.title} (ID: ${event.id})`);

        // Get all paid participants for this event WHO HAVEN'T RECEIVED REMINDER YET
        const transactions = await this.prisma.transaction.findMany({
          where: {
            eventId: event.id,
            status: PaymentStatus.PAID,
            transactionType: TransactionType.EVENT,
            reminderSentAt: null,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        totalParticipants += transactions.length;

        this.logger.log(`${transactions.length} participants need reminders`);

        // Process each transaction individually to ensure we track sent status
        for (const transaction of transactions) {
          const participantName = transaction.user.firstName + ' ' + transaction.user.lastName;

          try {
            // Send the reminder email
            await this.emailService.sendEventReminderEmail(
              transaction.user.email,
              participantName,
              event,
              transaction,
            );

            // Mark reminder as sent 
            await this.prisma.transaction.update({
              where: { id: transaction.id },
              data: { reminderSentAt: new Date() },
            });

            totalEmailsSent++;
          } catch (error) {
            totalEmailsFailed++;
            this.logger.error(
              `Failed to send reminder to ${transaction.user.email}: ${error.message}`,
            );
          }
        }
      }

      this.logger.log('========================================');
      this.logger.log('H-1 Event Reminder Job Completed');
      this.logger.log(`Total participants processed: ${totalParticipants}`);
      this.logger.log(`Emails sent successfully: ${totalEmailsSent}`);
      this.logger.log(`Emails failed: ${totalEmailsFailed}`);
      this.logger.log(`Skipped (already sent): ${totalSkipped}`);
      this.logger.log('========================================');
    } catch (error) {
      this.logger.error('Error in event reminder job:', error);
      throw error;
    }
  }
}