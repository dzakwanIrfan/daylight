import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import {
    Event,
    User,
    SubscriptionPlan,
    PaymentMethodType,
    PaymentMethod,
    TransactionStatus,
    Prisma,
} from '@prisma/client';
import {
    CreateXenditPaymentDto,
    ItemType,
} from '../dto/create-xendit-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { XenditUtilsService } from './xendit-utils.service';
import { XenditFeeCalculatorService } from './xendit-fee-calculator.service';
import { XenditPayloadBuilderService } from './xendit-payload-builder.service';
import { XenditResponseParserService } from './xendit-response-parser.service';
import {
    CreatePaymentResponse,
    XenditPaymentResponse,
    PaymentAction,
} from '../dto/payment-response.dto';
import { XenditSubscriptionService } from './xendit-subscription.service';
import { EmailService, EventEmailData, TransactionWithRelations } from 'src/email/email.service';

@Injectable()
export class XenditPaymentService {
    private readonly logger = new Logger(XenditPaymentService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly xenditUtilsService: XenditUtilsService,
        private readonly feeCalculator: XenditFeeCalculatorService,
        private readonly payloadBuilder: XenditPayloadBuilderService,
        private readonly responseParser: XenditResponseParserService,
        private readonly subscriptionService: XenditSubscriptionService,
        private readonly emailService: EmailService,
    ) { }

    async createXenditPayment(
        user: User,
        data: CreateXenditPaymentDto,
    ): Promise<CreatePaymentResponse> {
        // 1. Validasi dan ambil item (Event atau Subscription)
        const item = await this.getItemByType(data.type, data.itemId);
        let amount: number;
        let eventData: Event | null = null;

        // Tentukan amount berdasarkan tipe item
        if (data.type === ItemType.EVENT) {
            eventData = item as Event;
            amount = eventData.price;
        } else if (data.type === ItemType.SUBSCRIPTION) {
            // Untuk subscription, ambil harga berdasarkan country user
            const userWithLocation = await this.prismaService.user.findUnique({
                where: { id: user.id },
                include: {
                    currentCity: {
                        include: {
                            country: true,
                        },
                    },
                },
            });

            if (!userWithLocation?.currentCity?.country) {
                throw new BadRequestException(
                    'User must have a current city to purchase subscription',
                );
            }

            const subscriptionPlan =
                await this.prismaService.subscriptionPlan.findUnique({
                    where: { id: data.itemId },
                    include: {
                        prices: {
                            where: {
                                countryCode: userWithLocation.currentCity.country.code,
                                isActive: true,
                            },
                        },
                    },
                });

            if (!subscriptionPlan) {
                throw new NotFoundException('Subscription plan not found');
            }

            // Ambil harga sesuai country user
            const priceForCountry = subscriptionPlan.prices.find(
                (p) => p.countryCode === userWithLocation.currentCity!.country.code,
            );

            if (!priceForCountry) {
                throw new BadRequestException(
                    `Subscription not available in your country (${userWithLocation.currentCity.country.name})`,
                );
            }

            amount = priceForCountry.amount;
        } else {
            amount = (item as any).price;
        }

        if (!amount || amount <= 0) {
            throw new BadRequestException('Invalid item price');
        }

        // 2. Validasi payment method
        const paymentMethod = await this.getPaymentMethod(data.paymentMethodId);

        // 3. Validasi user country match dengan payment method
        await this.validateUserCountry(user, paymentMethod);

        // 4. Hitung fee dan final amount
        const feeCalculation = this.feeCalculator.getFormattedFeeInfo(
            amount,
            paymentMethod,
        );

        if (!feeCalculation.isValid) {
            throw new BadRequestException(feeCalculation.error);
        }

        // 5. Buat payload sesuai tipe payment method
        const payload = this.buildPaymentPayload(
            user,
            Math.ceil(feeCalculation.feeInfo!.finalAmount.toNumber()),
            paymentMethod,
            data,
        );

        // 6. Request ke Xendit
        const xenditResponse: XenditPaymentResponse =
            await this.xenditUtilsService.makeXenditRequest(payload);

        // 7. Parse response
        const paymentInfo = this.responseParser.extractPaymentInfo(xenditResponse);

        // 8. Simpan transaction ke database (termasuk actions)
        const transaction = await this.saveTransaction(
            user,
            data,
            paymentMethod,
            feeCalculation.feeInfo!,
            xenditResponse,
            paymentInfo,
        );

        this.logger.log('Payment created successfully', {
            transactionId: transaction.id,
            type: data.type,
            itemId: data.itemId,
            amount: amount,
            finalAmount: feeCalculation.feeInfo!.finalAmount.toNumber(),
        });

        // 9. Send pending payment email for EVENT transactions
        if (data.type === ItemType.EVENT && eventData) {
            await this.sendPendingPaymentEmail(transaction, eventData);
        }

        // 10. Return response
        return {
            transaction: {
                id: transaction.id,
                externalId: transaction.externalId,
                amount: transaction.amount.toNumber(),
                totalFee: transaction.totalFee.toNumber(),
                finalAmount: transaction.finalAmount.toNumber(),
                status: transaction.status,
                paymentUrl: paymentInfo.paymentUrl,
                paymentCode:
                    paymentInfo.paymentCode || paymentInfo.virtualAccountNumber,
                qrString: paymentInfo.qrString,
                virtualAccountNumber: paymentInfo.virtualAccountNumber,
                actions: transaction.actions?.map((action) => ({
                    type: action.type,
                    descriptor: action.descriptor,
                    value: action.value,
                })),
            },
            xenditResponse,
        };
    }

    /**
     * Send pending payment email after transaction created
     */
    private async sendPendingPaymentEmail(
        transaction: any,
        event: Event,
    ): Promise<void> {
        try {
            // Fetch full transaction with relations for email
            const fullTransaction = await this.prismaService.transaction.findUnique({
                where: { id: transaction.id },
                include: {
                    user: true,
                    event: true,
                    paymentMethod: {
                        include: {
                            country: true,
                        },
                    },
                    actions: true,
                    userSubscription: {
                        include: {
                            plan: true,
                        },
                    },
                },
            });

            if (!fullTransaction) {
                this.logger.warn('Transaction not found for email', {
                    transactionId: transaction.id,
                });
                return;
            }

            const eventEmailData: EventEmailData = {
                id: event.id,
                title: event.title,
                slug: event.slug,
                eventDate: event.eventDate,
                startTime: event.startTime,
                endTime: event.endTime,
                venue: event.venue,
                address: event.address,
                city: event.city,
                googleMapsUrl: event.googleMapsUrl,
                requirements: event.requirements,
            };

            await this.emailService.sendPaymentPendingEmail(
                fullTransaction as TransactionWithRelations,
                eventEmailData,
            );

            this.logger.log('Pending payment email sent', {
                transactionId: transaction.id,
                userEmail: fullTransaction.user.email,
            });
        } catch (error) {
            // Log error but do not throw - email failure should not affect payment creation
            this.logger.error('Failed to send pending payment email', {
                transactionId: transaction.id,
                error: error.message,
            });
        }
    }

    private async getItemByType(
        type: ItemType,
        itemId: string,
    ): Promise<Event | SubscriptionPlan> {
        let item: Event | SubscriptionPlan | null = null;

        if (type === ItemType.EVENT) {
            item = await this.prismaService.event.findUnique({
                where: { id: itemId, isActive: true },
            });

            if (!item) {
                throw new NotFoundException('Event not found or inactive');
            }
        } else if (type === ItemType.SUBSCRIPTION) {
            item = await this.prismaService.subscriptionPlan.findUnique({
                where: { id: itemId, isActive: true },
                include: {
                    prices: true,
                },
            });

            if (!item) {
                throw new NotFoundException('Subscription plan not found or inactive');
            }
        }

        return item!;
    }

    private async getPaymentMethod(
        paymentMethodId: string,
    ): Promise<PaymentMethod> {
        const paymentMethod = await this.prismaService.paymentMethod.findUnique({
            where: {
                id: paymentMethodId,
                isActive: true,
            },
            include: {
                country: true,
            },
        });

        if (!paymentMethod) {
            throw new NotFoundException('Payment method not found or inactive');
        }

        return paymentMethod;
    }

    private async validateUserCountry(
        user: User,
        paymentMethod: PaymentMethod,
    ): Promise<void> {
        if (!user.currentCityId) {
            throw new BadRequestException(
                'User must have a current city to make payment',
            );
        }

        const userCity = await this.prismaService.city.findUnique({
            where: { id: user.currentCityId },
            include: { country: true },
        });

        if (!userCity) {
            throw new BadRequestException('User city not found');
        }

        // Validasi currency match dengan country
        if (userCity.country.code !== paymentMethod.countryCode) {
            throw new BadRequestException(
                `Payment method ${paymentMethod.name} is not available in ${userCity.country.name}`,
            );
        }
    }

    private buildPaymentPayload(
        user: User,
        finalAmount: number,
        paymentMethod: PaymentMethod,
        data: CreateXenditPaymentDto,
    ): any {
        const options = {
            user,
            amount: finalAmount,
            paymentMethod,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            description: this.generatePaymentDescription(data.type, data.itemId),
        };

        switch (paymentMethod.type) {
            case PaymentMethodType.EWALLET:
                return this.payloadBuilder.buildEwalletPayload(options);

            case PaymentMethodType.QR_CODE:
                return this.payloadBuilder.buildQRCodePayload(options);

            case PaymentMethodType.BANK_TRANSFER:
                return this.payloadBuilder.buildVAPayload(options);

            case PaymentMethodType.OVER_THE_COUNTER:
                return this.payloadBuilder.buildOverTheCounterPayload(options);

            default:
                throw new BadRequestException(
                    `Unsupported payment method type: ${paymentMethod.type}`,
                );
        }
    }

    private generatePaymentDescription(type: ItemType, itemId: string): string {
        if (type === ItemType.SUBSCRIPTION) {
            return `DayLight Subscription Payment #${itemId.substring(0, 8)}`;
        }
        return `DayLight Event Payment #${itemId.substring(0, 8)}`;
    }

    /**
     * Simpan transaction beserta actions ke database
     */
    private async saveTransaction(
        user: User,
        data: CreateXenditPaymentDto,
        paymentMethod: PaymentMethod,
        feeInfo: any,
        xenditResponse: XenditPaymentResponse,
        paymentInfo: any,
    ) {
        const transactionData: Prisma.TransactionCreateInput = {
            user: {
                connect: { id: user.id },
            },
            paymentMethodName: paymentMethod.name,
            paymentMethod: {
                connect: { id: paymentMethod.id },
            },
            externalId: xenditResponse.reference_id,
            status: TransactionStatus.PENDING,
            amount: feeInfo.amount,
            totalFee: feeInfo.totalFee,
            finalAmount: feeInfo.finalAmount,
            paymentUrl: paymentInfo.paymentUrl || null,
            transactionType: data.type,
        };

        // Connect event jika type EVENT
        if (data.type === ItemType.EVENT) {
            transactionData.event = {
                connect: { id: data.itemId },
            };
        }

        // Simpan actions jika ada
        if (xenditResponse.actions && xenditResponse.actions.length > 0) {
            transactionData.actions = {
                create: xenditResponse.actions.map((action: PaymentAction) => ({
                    type: action.type,
                    descriptor: action.descriptor,
                    value: action.value,
                })),
            };
        }

        const transaction = await this.prismaService.transaction.create({
            data: transactionData,
            include: {
                actions: true,
            },
        });

        // Jika type SUBSCRIPTION, buat pending subscription
        if (data.type === ItemType.SUBSCRIPTION) {
            await this.subscriptionService.createPendingSubscription(
                user.id,
                data.itemId,
                transaction.id,
            );
        }

        this.logger.log('Transaction created with actions', {
            transactionId: transaction.id,
            externalId: transaction.externalId,
            amount: transaction.finalAmount.toNumber(),
            actionsCount: transaction.actions?.length || 0,
            type: data.type,
        });

        return transaction;
    }

    /**
     * Get available payment methods by country
     */
    async getAvailablePaymentMethods(user: User): Promise<PaymentMethod[]> {
        const userWithLocation = await this.prismaService.user.findUnique({
            where: { id: user.id },
            include: {
                currentCity: {
                    include: {
                        country: true,
                    },
                },
            },
        });

        if (!userWithLocation?.currentCity?.country) {
            throw new BadRequestException('User country information is missing');
        }

        return await this.prismaService.paymentMethod.findMany({
            where: {
                countryCode: userWithLocation.currentCity.country.code,
                isActive: true,
            },
            include: {
                country: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    /**
     * Calculate fee preview for user
     */
    async calculateFeePreview(
        amount: number,
        paymentMethodId: string,
    ): Promise<any> {
        const paymentMethod = await this.getPaymentMethod(paymentMethodId);
        const feeInfo = this.feeCalculator.getFormattedFeeInfo(
            amount,
            paymentMethod,
        );

        if (!feeInfo.isValid) {
            throw new BadRequestException(feeInfo.error);
        }

        return {
            paymentMethod: {
                id: paymentMethod.id,
                name: paymentMethod.name,
                code: paymentMethod.code,
                type: paymentMethod.type,
            },
            calculation: feeInfo.feeInfo!.breakdown,
        };
    }
}