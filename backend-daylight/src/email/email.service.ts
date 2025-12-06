import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  Transaction,
  Event,
  User,
  PaymentMethod,
  TransactionAction,
  UserSubscription,
  SubscriptionPlan,
} from '@prisma/client';

// Type definitions for email service
export interface TransactionWithRelations extends Transaction {
  user: User;
  event?: Event | null;
  paymentMethod?: PaymentMethod | null;
  actions?: TransactionAction[];
  userSubscription?: (UserSubscription & { plan: SubscriptionPlan }) | null;
}

export interface EventEmailData {
  id: string;
  title: string;
  slug: string;
  eventDate: Date;
  startTime: Date;
  endTime: Date;
  venue: string;
  address: string;
  city: string;
  googleMapsUrl?: string | null;
  requirements?: string[];
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  private getEmailTemplate(content: string): string {
    return `
      <! DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background-color: #FF5005;
            padding: 32px 40px;
            text-align: center;
          }
          .logo {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .email-body {
            padding: 40px;
          }
          . greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
          }
          .text {
            font-size: 15px;
            color: #4a4a4a;
            margin-bottom: 16px;
            line-height: 1.6;
          }
          .button-container {
            margin: 32px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #FF5005;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #e64804;
          }
          .link-fallback {
            margin-top: 24px;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 6px;
            border: 1px solid #e5e5e5;
          }
          .link-fallback-text {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
          }
          .link {
            font-size: 13px;
            color: #FF5005;
            word-break: break-all;
            text-decoration: none;
          }
          .info-box {
            background-color: #f9f9f9;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            padding: 24px;
            margin: 24px 0;
          }
          . info-box-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #FF5005;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          . info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
          .info-value {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 600;
            text-align: right;
          }
          .alert-box {
            padding: 16px 20px;
            border-radius: 6px;
            margin: 24px 0;
            font-size: 14px;
          }
          .alert-info {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            color: #1565c0;
          }
          .alert-warning {
            background-color: #fff3e0;
            border-left: 4px solid #ff9800;
            color: #e65100;
          }
          .alert-success {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            color: #2e7d32;
          }
          .alert-error {
            background-color: #ffebee;
            border-left: 4px solid #f44336;
            color: #c62828;
          }
          .payment-code-box {
            background-color: #fff9e6;
            border: 2px dashed #FF5005;
            border-radius: 6px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
          }
          .payment-code-label {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .payment-code {
            font-size: 32px;
            font-weight: 700;
            color: #FF5005;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
          }
          .list {
            margin: 20px 0;
            padding-left: 20px;
          }
          .list-item {
            font-size: 14px;
            color: #4a4a4a;
            margin-bottom: 12px;
            line-height: 1.6;
          }
          .divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 32px 0;
          }
          .email-footer {
            background-color: #f9f9f9;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
          }
          .footer-text {
            font-size: 13px;
            color: #999;
            margin-bottom: 8px;
          }
          .footer-link {
            color: #FF5005;
            text-decoration: none;
            font-size: 13px;
          }
          @media only screen and (max-width: 600px) {
            body {
              padding: 0;
            }
            .email-header {
              padding: 24px 20px;
            }
            .email-body {
              padding: 24px 20px;
            }
            .email-footer {
              padding: 24px 20px;
            }
            .info-row {
              flex-direction: column;
              gap: 4px;
            }
            .info-value {
              text-align: left;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-header">
            <h1 class="logo">DayLight</h1>
          </div>
          ${content}
          <div class="email-footer">
            <p class="footer-text">2025 DayLight.  All rights reserved.</p>
            <p class="footer-text">
              Need help? Contact us at <a href="mailto:support@daylight. com" class="footer-link">support@daylight.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format currency based on currency code
   */
  private formatCurrency(amount: number, currency: string = 'IDR'): string {
    const localeMap: Record<string, string> = {
      IDR: 'id-ID',
      USD: 'en-US',
      SGD: 'en-SG',
      MYR: 'ms-MY',
      PHP: 'en-PH',
      THB: 'th-TH',
      VND: 'vi-VN',
    };

    const locale = localeMap[currency] || 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format date with timezone support
   */
  private formatDate(date: Date, timezone: string = 'Asia/Jakarta'): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(date));
  }

  /**
   * Format time only
   */
  private formatTime(date: Date, timezone: string = 'Asia/Jakarta'): string {
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(date));
  }

  /**
   * Extract payment code from transaction actions
   */
  private extractPaymentCode(actions?: TransactionAction[]): string | null {
    if (!actions || actions.length === 0) return null;

    const paymentAction = actions.find(
      (action) =>
        action.descriptor === 'PAYMENT_CODE' ||
        action.descriptor === 'VIRTUAL_ACCOUNT_NUMBER',
    );

    return paymentAction?.value || null;
  }

  /**
   * Extract payment URL from transaction actions
   */
  private extractPaymentUrl(actions?: TransactionAction[]): string | null {
    if (!actions || actions.length === 0) return null;

    const urlAction = actions.find(
      (action) =>
        action.descriptor === 'WEB_URL' || action.descriptor === 'DEEPLINK_URL',
    );

    return urlAction?.value || null;
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email? token=${token}`;

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Thank you for registering with DayLight. We are excited to have you join our community. </p>
        <p class="text">To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
        
        <div class="button-container">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>

        <div class="link-fallback">
          <p class="link-fallback-text">If the button does not work, copy and paste this link into your browser:</p>
          <a href="${verificationUrl}" class="link">${verificationUrl}</a>
        </div>

        <div class="alert-box alert-info">
          <strong>Important:</strong> This verification link will expire in 24 hours for security purposes. 
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">If you did not create an account with DayLight, please disregard this email. </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Verify Your DayLight Email Address',
      html: this.getEmailTemplate(content),
    });
  }

  async sendResetPasswordEmail(email: string, token: string, name: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">We received a request to reset your password for your DayLight account. </p>
        <p class="text">To create a new password, click the button below:</p>
        
        <div class="button-container">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>

        <div class="link-fallback">
          <p class="link-fallback-text">If the button does not work, copy and paste this link into your browser:</p>
          <a href="${resetUrl}" class="link">${resetUrl}</a>
        </div>

        <div class="alert-box alert-warning">
          <strong>Security Notice:</strong> This password reset link will expire in 1 hour. 
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">If you did not request a password reset, please ignore this email.  Your password will remain unchanged.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Reset Your DayLight Password',
      html: this.getEmailTemplate(content),
    });
  }

  async sendWelcomeEmail(email: string, name: string, archetype: string) {
    const content = `
      <div class="email-body">
        <h2 class="greeting">Welcome to DayLight, ${name}!</h2>
        <p class="text">Your email has been successfully verified. We are thrilled to have you as part of our community. </p>
        
        <div class="info-box">
          <h3 class="info-box-title">Your Persona Profile</h3>
          <div class="info-row">
            <span class="info-label">Persona Type: </span>
            <span class="info-value">${archetype}</span>
          </div>
        </div>

        <div class="alert-box alert-success">
          <strong>Assessment Complete:</strong> You have completed your persona assessment. We will use this to connect you with like-minded individuals at DayLight gatherings.
        </div>

        <p class="text">Get ready to experience meaningful connections and discover new friendships at your next DayLight event. </p>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/events" class="button">Explore Events</a>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Welcome to DayLight',
      html: this.getEmailTemplate(content),
    });
  }

  // PAYMENT NOTIFICATION EMAILS (Xendit Integration)

  /**
   * Send payment pending notification email
   */
  async sendPaymentPendingEmail(
    transaction: TransactionWithRelations,
    event: EventEmailData,
  ) {
    const user = transaction.user;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer';
    const currency = transaction.paymentMethod?.currency || 'IDR';
    const paymentMethodName = transaction.paymentMethodName || transaction.paymentMethod?.name || 'Payment Gateway';
    const paymentCode = this.extractPaymentCode(transaction.actions);
    const paymentUrl = this.extractPaymentUrl(transaction.actions) || transaction.paymentUrl;

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Thank you for booking <strong>${event.title}</strong>. Your payment is currently pending.</p>
        
        <div class="info-box">
          <h3 class="info-box-title">Event Information</h3>
          <div class="info-row">
            <span class="info-label">Event Name: </span>
            <span class="info-value">${event.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date and Time: </span>
            <span class="info-value">${this.formatDate(event.eventDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location: </span>
            <span class="info-value">${event.venue}, ${event.city}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Payment Details</h3>
          <div class="info-row">
            <span class="info-label">Transaction ID: </span>
            <span class="info-value">${transaction.externalId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method: </span>
            <span class="info-value">${paymentMethodName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Subtotal: </span>
            <span class="info-value">${this.formatCurrency(transaction.amount.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transaction Fee: </span>
            <span class="info-value">${this.formatCurrency(transaction.totalFee.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Amount: </span>
            <span class="info-value">${this.formatCurrency(transaction.finalAmount.toNumber(), currency)}</span>
          </div>
        </div>

        ${paymentCode ? `
        <div class="payment-code-box">
          <p class="payment-code-label">Payment Code</p>
          <div class="payment-code">${paymentCode}</div>
        </div>
        ` : ''}

        <div class="alert-box alert-warning">
          <strong>Action Required:</strong> Please complete your payment as soon as possible to secure your spot at this event.
        </div>

        ${paymentUrl ? `
        <div class="button-container">
          <a href="${paymentUrl}" class="button">Complete Payment</a>
        </div>
        ` : ''}
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: user.email,
      subject: `Payment Pending - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send payment success notification email
   */
  async sendPaymentSuccessEmail(
    transaction: TransactionWithRelations,
    event: EventEmailData,
  ) {
    const user = transaction.user;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer';
    const currency = transaction.paymentMethod?.currency || 'IDR';
    const paymentMethodName = transaction.paymentMethodName || transaction.paymentMethod?.name || 'Payment Gateway';

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Great news! Your payment has been successfully processed.  You are all set for <strong>${event.title}</strong>.</p>
        
        <div class="alert-box alert-success">
          <strong>Registration Confirmed:</strong> Your spot at this event has been secured. 
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Event Information</h3>
          <div class="info-row">
            <span class="info-label">Event Name: </span>
            <span class="info-value">${event.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date and Time: </span>
            <span class="info-value">${this.formatDate(event.eventDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location: </span>
            <span class="info-value">${event.venue}, ${event.city}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Payment Summary</h3>
          <div class="info-row">
            <span class="info-label">Transaction ID: </span>
            <span class="info-value">${transaction.externalId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method: </span>
            <span class="info-value">${paymentMethodName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Amount Paid: </span>
            <span class="info-value">${this.formatCurrency(transaction.finalAmount.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Date: </span>
            <span class="info-value">${this.formatDate(transaction.paidAt || new Date())}</span>
          </div>
        </div>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/my-events" class="button">View My Events</a>
        </div>

        <div class="divider"></div>

        <p class="text"><strong>What is Next?</strong></p>
        <ul class="list">
          <li class="list-item">Mark your calendar for ${this.formatDate(event.eventDate)}</li>
          <li class="list-item">You will receive event details and reminders closer to the date</li>
          <li class="list-item">Check your DayLight dashboard for updates and announcements</li>
        </ul>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: user.email,
      subject: `Payment Successful - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send payment expired notification email
   */
  async sendPaymentExpiredEmail(
    transaction: TransactionWithRelations,
    event: EventEmailData,
  ) {
    const user = transaction.user;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer';

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Your payment for <strong>${event.title}</strong> has expired. </p>
        
        <div class="alert-box alert-warning">
          <strong>Payment Expired:</strong> Transaction ${transaction.externalId} is no longer valid and cannot be processed.
        </div>

        <p class="text">Do not worry! You can still attend this event by creating a new booking. Simply visit the event page and complete a new registration.</p>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/events/${event.slug}" class="button">Book Again</a>
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">If you have any questions or need assistance, please do not hesitate to reach out to our support team.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: user.email,
      subject: `Payment Expired - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send payment failed notification email
   */
  async sendPaymentFailedEmail(
    transaction: TransactionWithRelations,
    event: EventEmailData,
  ) {
    const user = transaction.user;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer';

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">We are sorry, but your payment for <strong>${event.title}</strong> could not be processed. </p>
        
        <div class="alert-box alert-error">
          <strong>Payment Failed:</strong> Transaction ${transaction.externalId} was not successfully processed.
        </div>

        <p class="text"><strong>What You Can Do:</strong></p>
        <ul class="list">
          <li class="list-item">Verify your payment method details and try again</li>
          <li class="list-item">Try using a different payment method</li>
          <li class="list-item">Contact your bank if the issue persists</li>
          <li class="list-item">Reach out to our support team for assistance</li>
        </ul>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/events/${event.slug}" class="button">Try Again</a>
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">We are here to help.  If you continue experiencing issues, please contact our support team and we will assist you with your booking.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: user.email,
      subject: `Payment Failed - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send subscription payment success email
   */
  async sendSubscriptionPaymentSuccessEmail(
    transaction: TransactionWithRelations,
  ) {
    const user = transaction.user;
    const subscription = transaction.userSubscription;

    if (!subscription) {
      throw new Error('Subscription data is required for subscription payment email');
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer';
    const currency = transaction.paymentMethod?.currency || 'IDR';
    const paymentMethodName = transaction.paymentMethodName || transaction.paymentMethod?.name || 'Payment Gateway';

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Your subscription payment has been successfully processed.  Welcome to DayLight Premium!</p>
        
        <div class="alert-box alert-success">
          <strong>Subscription Activated:</strong> You now have access to all premium features.
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Subscription Details</h3>
          <div class="info-row">
            <span class="info-label">Plan: </span>
            <span class="info-value">${subscription.plan.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration: </span>
            <span class="info-value">${subscription.plan.durationInMonths} Month(s)</span>
          </div>
          <div class="info-row">
            <span class="info-label">Start Date: </span>
            <span class="info-value">${subscription.startDate ? this.formatDate(subscription.startDate) : 'Immediately'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">End Date: </span>
            <span class="info-value">${subscription.endDate ? this.formatDate(subscription.endDate) : 'N/A'}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Payment Summary</h3>
          <div class="info-row">
            <span class="info-label">Transaction ID: </span>
            <span class="info-value">${transaction.externalId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method: </span>
            <span class="info-value">${paymentMethodName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Amount Paid: </span>
            <span class="info-value">${this.formatCurrency(transaction.finalAmount.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Date: </span>
            <span class="info-value">${this.formatDate(transaction.paidAt || new Date())}</span>
          </div>
        </div>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard" class="button">Go to Dashboard</a>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: user.email,
      subject: `Subscription Activated - ${subscription.plan.name}`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send transaction notification to admin
   */
  async sendTransactionNotificationToAdmin(
    transaction: TransactionWithRelations,
  ) {
    const adminEmail = this.configService.get('ADMIN_EMAIL') || 'contact@himgroup.asia';
    const currency = transaction.paymentMethod?.currency || 'IDR';
    const paymentMethodName = transaction.paymentMethodName || transaction.paymentMethod?.name || 'Payment Gateway';

    const transactionType = transaction.transactionType === 'EVENT' ? 'Event Registration' : 'Subscription';
    const itemName = transaction.event?.title || transaction.userSubscription?.plan?.name || 'N/A';

    const userName = `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`.trim() || 'N/A';

    const content = `
      <div class="email-body">
        <h2 class="greeting">New Transaction Alert</h2>
        <p class="text">A new transaction has been created on DayLight platform.</p>
        
        <div class="alert-box ${transaction.status === 'PAID' ? 'alert-success' : 'alert-warning'}">
          <strong>Status:</strong> ${transaction.status}
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Transaction Information</h3>
          <div class="info-row">
            <span class="info-label">Transaction ID:</span>
            <span class="info-value">${transaction.id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">External ID:</span>
            <span class="info-value">${transaction.externalId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transaction Type:</span>
            <span class="info-value">${transactionType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Item:</span>
            <span class="info-value">${itemName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Base Amount:</span>
            <span class="info-value">${this.formatCurrency(transaction.amount.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fee:</span>
            <span class="info-value">${this.formatCurrency(transaction.totalFee.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span class="info-value">${this.formatCurrency(transaction.finalAmount.toNumber(), currency)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${paymentMethodName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Created At:</span>
            <span class="info-value">${this.formatDate(transaction.createdAt)}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Customer Information</h3>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${userName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${transaction.user.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${transaction.user.phoneNumber || '-'}</span>
          </div>
        </div>

        ${transaction.event ? `
        <div class="info-box">
          <h3 class="info-box-title">Event Details</h3>
          <div class="info-row">
            <span class="info-label">Event Name:</span>
            <span class="info-value">${transaction.event.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event Date:</span>
            <span class="info-value">${this.formatDate(transaction.event.eventDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">${transaction.event.venue}, ${transaction.event.city}</span>
          </div>
        </div>
        ` : ''}

        ${transaction.userSubscription ? `
        <div class="info-box">
          <h3 class="info-box-title">Subscription Details</h3>
          <div class="info-row">
            <span class="info-label">Plan:</span>
            <span class="info-value">${transaction.userSubscription.plan?.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration:</span>
            <span class="info-value">${transaction.userSubscription.plan?.durationInMonths} Month(s)</span>
          </div>
        </div>
        ` : ''}

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">
          This is an automated notification from DayLight transaction system. 
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: adminEmail,
      subject: `[DayLight] New ${transactionType} - ${transaction.externalId}`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send event reminder to participant (H-1)
   */
  async sendEventReminderEmail(
    transaction: TransactionWithRelations,
    event: EventEmailData,
  ) {
    const user = transaction.user;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Customer';

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">This is a friendly reminder that your DayLight event is happening <strong>tomorrow</strong>!</p>
        
        <div class="alert-box alert-info">
          <strong>Event Tomorrow:</strong> Do not forget to mark your calendar! 
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Event Details</h3>
          <div class="info-row">
            <span class="info-label">Event Name:</span>
            <span class="info-value">${event.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${this.formatDate(event.eventDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time:</span>
            <span class="info-value">${this.formatTime(event.startTime)} - ${this.formatTime(event.endTime)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">${event.venue}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="info-value">${event.address}, ${event.city}</span>
          </div>
        </div>

        ${event.googleMapsUrl ? `
        <div class="button-container">
          <a href="${event.googleMapsUrl}" class="button">Get Directions</a>
        </div>
        ` : ''}

        <div class="info-box">
          <h3 class="info-box-title">What to Bring</h3>
          <ul class="list">
            <li class="list-item">Your booking confirmation (Transaction ID: ${transaction.externalId})</li>
            <li class="list-item">Valid ID card</li>
            <li class="list-item">Positive energy and open mind! </li>
          </ul>
        </div>

        ${event.requirements && event.requirements.length > 0 ? `
        <div class="info-box">
          <h3 class="info-box-title">Event Requirements</h3>
          <ul class="list">
            ${event.requirements.map((req: string) => `<li class="list-item">${req}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="alert-box alert-warning">
          <strong>Important:</strong> Please arrive 15 minutes before the event starts. 
        </div>

        <div class="divider"></div>

        <p class="text"><strong>Questions?</strong></p>
        <p class="text">If you have any questions or need assistance, feel free to contact us at 
          <a href="mailto:support@daylight.com" class="link">support@daylight.com</a>
        </p>

        <p class="text">We are excited to see you tomorrow!</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: user.email,
      subject: `Reminder: ${event.title} is Tomorrow!`,
      html: this.getEmailTemplate(content),
    });
  }

  /**
   * Send bulk event reminders
   */
  async sendBulkEventReminders(
    participants: Array<{
      transaction: TransactionWithRelations;
      event: EventEmailData;
    }>,
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    for (const participant of participants) {
      try {
        await this.sendEventReminderEmail(
          participant.transaction,
          participant.event,
        );
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: participant.transaction.user.email,
          error: error.message,
        });
      }
    }

    return results;
  }
}