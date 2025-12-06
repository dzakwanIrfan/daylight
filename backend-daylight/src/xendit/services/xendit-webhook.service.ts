import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { XenditWebhookPayload } from '../dto/xendit-webhook-payload.dto';
import { TransactionStatus } from '@prisma/client';
import { XenditPaymentGateway } from '../xendit-payment.gateway';
import { XenditSubscriptionService } from './xendit-subscription.service';
import { EmailService, EventEmailData, TransactionWithRelations } from 'src/email/email.service';

@Injectable()
export class XenditWebhookService {
    private readonly logger = new Logger(XenditWebhookService.name);

    constructor(
        private readonly prismaService: PrismaService,
        @Inject(forwardRef(() => XenditPaymentGateway))
        private readonly paymentGateway: XenditPaymentGateway,
        private readonly subscriptionService: XenditSubscriptionService,
        private readonly emailService: EmailService,
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
                userSubscription: {
                    include: {
                        plan: true,
                    },
                },
                paymentMethod: {
                    include: {
                        country: true,
                    },
                },
            },
        });

        if (!transaction) {
            this.logger.warn('Transaction not found for webhook', {
                reference_id: data.reference_id,
            });
            return;
        }

        // Update transaction status berdasarkan event
        await this.updateTransactionStatus(
            transaction as TransactionWithRelations,
            event,
            data,
        );
    }

    private async updateTransactionStatus(
        transaction: TransactionWithRelations,
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
                paidAt: newStatus === TransactionStatus.PAID ? new Date() : undefined,
                updatedAt: new Date(),
            },
            include: {
                event: true,
                user: true,
                actions: true,
                paymentMethod: {
                    include: {
                        country: true,
                    },
                },
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

        // Send email notification based on status
        await this.sendEmailNotification(
            updatedTransaction as TransactionWithRelations,
            newStatus,
        );

        // Emit WebSocket event
        this.emitPaymentStatusUpdate(
            updatedTransaction as TransactionWithRelations,
            newStatus,
        );
    }

    /**
     * Send email notification based on transaction status
     */
    private async sendEmailNotification(
        transaction: TransactionWithRelations,
        status: TransactionStatus,
    ): Promise<void> {
        try {
            // For event transactions
            if (transaction.event) {
                const eventEmailData: EventEmailData = {
                    id: transaction.event.id,
                    title: transaction.event.title,
                    slug: transaction.event.slug,
                    eventDate: transaction.event.eventDate,
                    startTime: transaction.event.startTime,
                    endTime: transaction.event.endTime,
                    venue: transaction.event.venue,
                    address: transaction.event.address,
                    city: transaction.event.city,
                    googleMapsUrl: transaction.event.googleMapsUrl,
                    requirements: transaction.event.requirements,
                };

                switch (status) {
                    case TransactionStatus.PAID:
                        await this.emailService.sendPaymentSuccessEmail(
                            transaction,
                            eventEmailData,
                        );
                        await this.emailService.sendTransactionNotificationToAdmin(
                            transaction,
                        );
                        break;

                    case TransactionStatus.FAILED:
                        await this.emailService.sendPaymentFailedEmail(
                            transaction,
                            eventEmailData,
                        );
                        break;

                    case TransactionStatus.EXPIRED:
                        await this.emailService.sendPaymentExpiredEmail(
                            transaction,
                            eventEmailData,
                        );
                        break;
                }
            }

            // For subscription transactions
            if (transaction.userSubscription && status === TransactionStatus.PAID) {
                await this.emailService.sendSubscriptionPaymentSuccessEmail(
                    transaction,
                );
                await this.emailService.sendTransactionNotificationToAdmin(transaction);
            }

            this.logger.log('Email notification sent', {
                transactionId: transaction.id,
                status,
                type: transaction.transactionType,
            });
        } catch (error) {
            this.logger.error('Failed to send email notification', {
                transactionId: transaction.id,
                error: error.message,
            });
            // Do not throw - email failure should not affect webhook processing
        }
    }

    private emitPaymentStatusUpdate(
        transaction: TransactionWithRelations,
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

    private async handleSuccessfulPayment(
        transaction: TransactionWithRelations,
    ): Promise<void> {
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

    private async handleFailedPayment(
        transaction: TransactionWithRelations,
    ): Promise<void> {
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

    private async handleExpiredPayment(
        transaction: TransactionWithRelations,
    ): Promise<void> {
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