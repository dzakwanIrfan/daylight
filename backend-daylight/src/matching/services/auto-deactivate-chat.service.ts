import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AutoDeactivateChatService {
    private readonly logger = new Logger(AutoDeactivateChatService.name);
    private isProcessing = false;

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Auto-deactivate chats for events that have ended
     * Runs every 15 minutes
     */
    @Cron('*/15 * * * *', {
        timeZone: 'Asia/Jakarta',
    })
    async autoDeactivateChats() {
        if (this.isProcessing) {
            this.logger.warn('Auto-deactivate job is already running. Skipping...');
            return;
        }

        this.isProcessing = true;
        this.logger.log('Starting auto-deactivate chat job...');

        try {
            const now = new Date();

            // Find all events that have ended (endTime <= now)
            // AND have active matching groups
            const endedEvents = await this.prisma.event.findMany({
                where: {
                    endTime: {
                        lte: now,
                    },
                    status: 'PUBLISHED',
                    matchingGroups: {
                        some: {
                            isActive: true,
                        },
                    },
                },
                include: {
                    matchingGroups: {
                        where: {
                            isActive: true,
                        },
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    cityRelation: {
                        include: {
                            country: true,
                        },
                    },
                },
            });

            if (endedEvents.length === 0) {
                this.logger.log('No events found that need chat deactivation');
                return;
            }

            this.logger.log(
                `Found ${endedEvents.length} event(s) with active chats to deactivate`,
            );

            let totalGroupsDeactivated = 0;
            let totalNotificationsSent = 0;
            let totalEmailsSent = 0;

            for (const event of endedEvents) {
                this.logger.log(`Processing event: ${event.title} (ID: ${event.id})`);

                try {
                    // Deactivate all active groups for this event
                    const updateResult = await this.prisma.matchingGroup.updateMany({
                        where: {
                            eventId: event.id,
                            isActive: true,
                        },
                        data: {
                            isActive: false,
                        },
                    });

                    totalGroupsDeactivated += updateResult.count;

                    this.logger.log(
                        `✓ Deactivated ${updateResult.count} group(s) for ${event.title}`,
                    );

                    // Send notifications and emails to all participants
                    const processedUsers = new Set<string>();

                    for (const group of event.matchingGroups) {
                        for (const member of group.members) {
                            // Skip if already processed
                            if (processedUsers.has(member.userId)) {
                                continue;
                            }

                            try {
                                const user = member.user;
                                const name =
                                    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                                    'Participant';

                                // Create in-app notification
                                await this.notificationsService.createNotification({
                                    userId: user.id,
                                    type: NotificationType.SYSTEM,
                                    title: 'Event Chat Closed',
                                    message: `The chat for "${event.title}" has been closed. Thank you for participating!`,
                                    referenceId: event.id,
                                    referenceType: 'event',
                                    metadata: {
                                        eventId: event.id,
                                        eventTitle: event.title,
                                        groupId: group.id,
                                        groupNumber: group.groupNumber,
                                    },
                                });

                                totalNotificationsSent++;

                                // Send email notification
                                await this.emailService.sendChatClosedEmail(user, event, group);

                                totalEmailsSent++;

                                processedUsers.add(member.userId);

                                this.logger.log(`✓ Sent notifications to ${user.email}`);
                            } catch (error) {
                                this.logger.error(
                                    `Failed to send notification to user ${member.userId}: ${error.message}`,
                                );
                            }
                        }
                    }

                    // Send admin notification
                    await this.sendAdminNotification(event, updateResult.count);
                } catch (error) {
                    this.logger.error(
                        `Failed to process event ${event.title}: ${error.message}`,
                    );
                }
            }

            this.logger.log('========================================');
            this.logger.log('Auto-Deactivate Chat Job Completed');
            this.logger.log(`Total groups deactivated: ${totalGroupsDeactivated}`);
            this.logger.log(`Total notifications sent: ${totalNotificationsSent}`);
            this.logger.log(`Total emails sent: ${totalEmailsSent}`);
            this.logger.log('========================================');
        } catch (error) {
            this.logger.error('Error in auto-deactivate chat job:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Send notification to admin
     */
    private async sendAdminNotification(event: any, groupsDeactivated: number) {
        try {
            await this.emailService.sendChatDeactivationAdminEmail(
                event,
                groupsDeactivated,
            );
            this.logger.log('✓ Sent deactivation notification to admin');
        } catch (error) {
            this.logger.error(
                `Failed to send admin notification: ${error.message}`,
            );
        }
    }

    /**
     * Manual trigger for testing or specific event
     */
    async manualTrigger(eventId?: string) {
        this.logger.log('Manual trigger initiated...');

        if (eventId) {
            // Trigger for specific event
            const event = await this.prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    matchingGroups: {
                        where: {
                            isActive: true,
                        },
                        include: {
                            members: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
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

            if (event.matchingGroups.length === 0) {
                return {
                    message: 'No active groups to deactivate',
                    groupsDeactivated: 0,
                };
            }

            // Deactivate groups
            const updateResult = await this.prisma.matchingGroup.updateMany({
                where: {
                    eventId: event.id,
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });

            // Send notifications
            const processedUsers = new Set<string>();

            for (const group of event.matchingGroups) {
                for (const member of group.members) {
                    if (processedUsers.has(member.userId)) {
                        continue;
                    }

                    const user = member.user;

                    await this.notificationsService.createNotification({
                        userId: user.id,
                        type: NotificationType.SYSTEM,
                        title: 'Event Chat Closed',
                        message: `The chat for "${event.title}" has been closed. Thank you for participating!`,
                        referenceId: event.id,
                        referenceType: 'event',
                        metadata: {
                            eventId: event.id,
                            eventTitle: event.title,
                            groupId: group.id,
                            groupNumber: group.groupNumber,
                        },
                    });

                    await this.emailService.sendChatClosedEmail(user, event, group);

                    processedUsers.add(member.userId);
                }
            }

            await this.sendAdminNotification(event, updateResult.count);

            return {
                message: 'Manual deactivation completed',
                groupsDeactivated: updateResult.count,
                notificationsSent: processedUsers.size,
            };
        } else {
            // Run full cron job
            await this.autoDeactivateChats();
            return { message: 'Manual trigger completed' };
        }
    }
}