import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PersonalityModule } from './personality/personality.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { UserEventsModule } from './user-events/user-events.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UserStatsModule } from './user-stats/user-stats.module';
import { PersonaQuestionModule } from './persona-question/persona-question.module';
import { ArchetypeDetailModule } from './archetype-detail/archetype-detail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get('RATE_LIMIT_TTL') || 60,
        limit: config.get('RATE_LIMIT_MAX') || 100,
      }]),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PersonalityModule,
    EmailModule,
    UploadModule,
    AdminModule,
    EventsModule,
    PaymentMethodsModule,
    PaymentModule,
    UserEventsModule,
    TransactionsModule,
    SubscriptionsModule,
    DashboardModule,
    UserStatsModule,
    PersonaQuestionModule,
    ArchetypeDetailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}