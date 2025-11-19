import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentGateway } from './payment.gateway';
import { PaymentCountdownService } from './payment-countdown.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { EventsService } from 'src/events/events.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    PaymentMethodsModule,
    SubscriptionsModule,
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }
        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentGateway,
    PaymentCountdownService,
    EventsService,
  ],
  exports: [PaymentService, PaymentGateway],
})
export class PaymentModule {}