import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class XenditSubscriptionService {
    private readonly logger = new Logger(XenditSubscriptionService.name);

    constructor(private readonly prismaService: PrismaService) { }

    /**
     * Create pending subscription saat transaction dibuat
     */
    async createPendingSubscription(
        userId: string,
        planId: string,
        transactionId: string,
    ) {
        const existingSubscription =
            await this.prismaService.userSubscription.findFirst({
                where: {
                    userId,
                    transactionId,
                },
            });

        if (existingSubscription) {
            this.logger.warn('Subscription already exists for this transaction', {
                subscriptionId: existingSubscription.id,
                transactionId,
            });
            return existingSubscription;
        }

        const subscription = await this.prismaService.userSubscription.create({
            data: {
                userId,
                planId,
                transactionId,
                status: 'PENDING',
            },
        });

        this.logger.log('Created pending subscription', {
            subscriptionId: subscription.id,
            userId,
            planId,
            transactionId,
        });

        return subscription;
    }

    /**
     * Activate subscription when payment is successful
     */
    async activateSubscription(subscriptionId: string): Promise<void> {
        const subscription = await this.prismaService.userSubscription.findUnique({
            where: { id: subscriptionId },
            include: { plan: true },
        });

        if (!subscription) {
            this.logger.error('Subscription not found for activation', {
                subscriptionId,
            });
            return;
        }

        if (subscription.status === 'ACTIVE') {
            this.logger.warn('Subscription already active', { subscriptionId });
            return;
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + subscription.plan.durationInMonths);

        await this.prismaService.userSubscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'ACTIVE',
                startDate,
                endDate,
            },
        });

        this.logger.log('Subscription activated', {
            subscriptionId,
            userId: subscription.userId,
            planId: subscription.planId,
            startDate,
            endDate,
        });
    }
}
