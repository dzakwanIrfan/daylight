import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { XenditWebhookPayload } from '../dto/xendit-webhook-payload.dto';
import { TransactionStatus } from '@prisma/client';
import { XenditPaymentGateway } from '../xendit-payment.gateway';
import { XenditSubscriptionService } from './xendit-subscription.service';

@Injectable()
export class XenditWebhookService {
    private readonly logger = new Logger(XenditWebhookService.name);

    constructor(
        private readonly prismaService: PrismaService,
        @Inject(forwardRef(() => XenditPaymentGateway))
        private readonly paymentGateway: XenditPaymentGateway,
        private readonly subscriptionService: XenditSubscriptionService,
    ) { }

    /**
     * Handle webhook dari Xendit
     */
    async handleWebhook(webhookPayload: XenditWebhookPayload): Promise<void> {
        const { event, data } = webhookPayload;

        this.logger.log('Processing Xendit webhook', {
            event,
            reference_id: data.reference_id,
            status: data.status,
        });

        // Cari transaction berdasarkan reference_id
        const transaction = await this.prismaService.transaction.findUnique({
            where: { externalId: data.reference_id },
            include: {
                event: true,
                user: true,
                actions: true,
                userSubscription: true,
            },
        });

        if (!transaction) {
            this.logger.warn('Transaction not found for webhook', {
                reference_id: data.reference_id,
            });
            return;
        }

        // Update transaction status berdasarkan event
        await this.updateTransactionStatus(transaction, event, data);
    }

    private async updateTransactionStatus(
        transaction: any,
        event: string,
        data: any,
    ): Promise<void> {
        let newStatus: TransactionStatus;

        switch (event) {
            case 'payment.capture':
            case 'payment.authorization':
                newStatus = TransactionStatus.PAID;
                await this.handleSuccessfulPayment(transaction);
                break;

            case 'payment.failure':
                newStatus = TransactionStatus.FAILED;
                await this.handleFailedPayment(transaction);
                break;

            case 'payment.expired':
                newStatus = TransactionStatus.EXPIRED;
                await this.handleExpiredPayment(transaction);
                break;

            default:
                this.logger.warn('Unknown webhook event', { event });
                return;
        }

        // Update transaction
        const updatedTransaction = await this.prismaService.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus,
                paidAt: new Date(),
                updatedAt: new Date(),
            },
            include: {
                event: true,
                userSubscription: {
                    include: {
                        plan: true,
                    },
                },
            },
        });

        this.logger.log('Transaction status updated', {
            transactionId: transaction.id,
            oldStatus: transaction.status,
            newStatus,
        });

        // Emit WebSocket event
        this.emitPaymentStatusUpdate(updatedTransaction, newStatus);
    }

    private emitPaymentStatusUpdate(
        transaction: any,
        newStatus: TransactionStatus,
    ): void {
        const eventData = {
            transactionId: transaction.id,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            event: transaction.event,
            subscription: transaction.userSubscription,
            amount: transaction.finalAmount.toNumber(),
        };

        switch (newStatus) {
            case TransactionStatus.PAID:
                this.paymentGateway.emitPaymentSuccess(
                    transaction.id,
                    transaction.userId,
                    eventData,
                );
                break;
            case TransactionStatus.FAILED:
                this.paymentGateway.emitPaymentFailed(
                    transaction.id,
                    transaction.userId,
                    eventData,
                );
                break;
            case TransactionStatus.EXPIRED:
                this.paymentGateway.emitPaymentExpired(
                    transaction.id,
                    transaction.userId,
                );
                break;
            default:
                this.paymentGateway.emitPaymentStatusUpdate(transaction.id, eventData);
        }
    }

    private async handleSuccessfulPayment(transaction: any): Promise<void> {
        // Jika ada event, update currentParticipants
        if (transaction.eventId) {
            await this.prismaService.event.update({
                where: { id: transaction.eventId },
                data: {
                    currentParticipants: {
                        increment: 1,
                    },
                },
            });

            this.logger.log('Event participants updated', {
                eventId: transaction.eventId,
            });
        }

        // Handle subscription jika ada
        if (transaction.userSubscription) {
            await this.subscriptionService.activateSubscription(
                transaction.userSubscription.id,
            );
        }
    }

    private async handleFailedPayment(transaction: any): Promise<void> {
        // Cancel subscription jika ada
        if (transaction.userSubscription) {
            await this.prismaService.userSubscription.update({
                where: { id: transaction.userSubscription.id },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                    metadata: {
                        reason: 'Payment failed',
                    },
                },
            });

            this.logger.log('Subscription cancelled due to payment failure', {
                subscriptionId: transaction.userSubscription.id,
            });
        }
    }

    private async handleExpiredPayment(transaction: any): Promise<void> {
        // Cancel subscription jika ada
        if (transaction.userSubscription) {
            await this.prismaService.userSubscription.update({
                where: { id: transaction.userSubscription.id },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                    metadata: {
                        reason: 'Payment expired',
                    },
                },
            });

            this.logger.log('Subscription cancelled due to payment expiry', {
                subscriptionId: transaction.userSubscription.id,
            });
        }
    }
}
