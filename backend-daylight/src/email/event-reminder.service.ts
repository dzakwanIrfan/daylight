import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { PaymentStatus, TransactionType } from '@prisma/client';

@Injectable()
export class EventReminderService {
  private readonly logger = new Logger(EventReminderService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Send H-1 event reminders
   * Runs every 10 minutes
   */
  @Cron('*/10 * * * *', {
    timeZone: 'Asia/Jakarta',
  })
  async sendTomorrowEventReminders() {
    this.logger.log('Starting H-1 event reminder job...');

    try {
      // Calculate tomorrow's date range (midnight to midnight)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      this.logger.log(`📅 Finding events between ${tomorrow.toISOString()} and ${dayAfterTomorrow.toISOString()}`);

      // Find all events happening tomorrow
      const tomorrowEvents = await this.prisma.event.findMany({
        where: {
          eventDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
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

      if (tomorrowEvents.length === 0) {
        return;
      }

      this.logger.log(`Found ${tomorrowEvents.length} events tomorrow`);

      let totalParticipants = 0;
      let totalEmailsSent = 0;
      let totalEmailsFailed = 0;

      // Process each event
      for (const event of tomorrowEvents) {
        this.logger.log(`Processing event: ${event.title}`);

        // Get all paid participants for this event
        const transactions = await this.prisma.transaction.findMany({
          where: {
            eventId: event.id,
            paymentStatus: PaymentStatus.PAID,
            transactionType: TransactionType.EVENT,
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        totalParticipants += transactions.length;

        if (transactions.length === 0) {
          this.logger.log(`No participants for ${event.title}`);
          continue;
        }

        this.logger.log(`${transactions.length} participants found`);
        // Prepare participant data
        const participants = transactions.map((transaction) => ({
          email: transaction.customerEmail,
          name: transaction.customerName || 
                `${transaction.user?.firstName || ''} ${transaction.user?.lastName || ''}`.trim() || 
                'Participant',
          event,
          transaction,
        }));

        // Send bulk reminders
        const results = await this.emailService.sendBulkEventReminders(participants);

        totalEmailsSent += results.success;
        totalEmailsFailed += results.failed;

        this.logger.log(`${results.success} emails sent`);
        if (results.failed > 0) {
          this.logger.error(`${results.failed} emails failed`);
          results.errors.forEach((error) => {
            this.logger.error(`- ${error.email}: ${error.error}`);
          });
        }
      }

    } catch (error) {
      this.logger.error('Error in event reminder job:', error);
      throw error;
    }
  }
}