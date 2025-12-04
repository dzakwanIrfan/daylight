import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentGateway } from './payment.gateway';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentCountdownService {
  private readonly logger = new Logger(PaymentCountdownService.name);

  constructor(
    private prisma: PrismaService,
    private paymentGateway: PaymentGateway,
  ) {}

  /**
   * Check pending payments every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingPayments() {
    try {
      const now = new Date();

      // Get pending payments that haven't expired yet
      const pendingTransactions = await this.prisma.legacyTransaction.findMany({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          expiredAt: {
            gt: now,
          },
        },
        select: {
          id: true,
          userId: true,
          expiredAt: true,
        },
      });

      for (const transaction of pendingTransactions) {
        if (!transaction.expiredAt) {
          continue;
        }

        const timeRemaining = Math.floor(
          (transaction.expiredAt.getTime() - now.getTime()) / 1000,
        );

        // Only emit countdown if user is connected
        if (this.paymentGateway.isUserConnected(transaction.userId)) {
          // Send countdown every minute when less than 1 hour remaining
          if (timeRemaining <= 3600) {
            this.paymentGateway.emitPaymentCountdown(
              transaction.id,
              timeRemaining,
            );
          }

          // Send urgent warning at 5 minutes
          if (timeRemaining === 300) {
            this.paymentGateway.emitPaymentUpdateToUser(transaction.userId, {
              type: 'payment:warning',
              transactionId: transaction.id,
              message: '⚠️ Pembayaran akan kadaluarsa dalam 5 menit!',
              timeRemaining,
            });
          }

          // Send final warning at 1 minute
          if (timeRemaining === 60) {
            this.paymentGateway.emitPaymentUpdateToUser(transaction.userId, {
              type: 'payment:urgent',
              transactionId: transaction.id,
              message: '🚨 Pembayaran akan kadaluarsa dalam 1 menit!',
              timeRemaining,
            });
          }
        }
      }

      this.logger.debug(
        `Checked ${pendingTransactions.length} pending transactions`,
      );
    } catch (error) {
      this.logger.error(`Error checking pending payments: ${error.message}`);
    }
  }

  /**
   * Auto-expire transactions that passed expiration time
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoExpireTransactions() {
    try {
      const now = new Date();

      const expiredTransactions = await this.prisma.legacyTransaction.findMany({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          expiredAt: {
            lte: now,
          },
        },
      });

      for (const transaction of expiredTransactions) {
        await this.prisma.legacyTransaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: PaymentStatus.EXPIRED,
          },
        });

        // Emit expired notification
        this.paymentGateway.emitPaymentExpired(
          transaction.id,
          transaction.userId,
        );

        this.logger.log(`Auto-expired transaction: ${transaction.id}`);
      }

      if (expiredTransactions.length > 0) {
        this.logger.log(
          `Auto-expired ${expiredTransactions.length} transactions`,
        );
      }
    } catch (error) {
      this.logger.error(`Error auto-expiring transactions: ${error.message}`);
    }
  }
}