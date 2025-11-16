import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(SubscriptionsScheduler.name);

  constructor(private subscriptionsService: SubscriptionsService) {}

  /**
   * Run daily at 00:00 to expire subscriptions
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionExpiry() {
    this.logger.log('Running subscription expiry check...');
    
    try {
      const result = await this.subscriptionsService.autoExpireSubscriptions();
      
      this.logger.log(
        `Subscription expiry check completed. Expired: ${result.expiredCount}`
      );
    } catch (error) {
      this.logger.error(
        `Error during subscription expiry check: ${error.message}`
      );
    }
  }
}