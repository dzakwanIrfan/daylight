import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
      <!DOCTYPE html>
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
          .greeting {
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
          .info-box-title {
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
          .info-row:last-child {
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
            <p class="footer-text">© 2025 DayLight. All rights reserved.</p>
            <p class="footer-text">
              Need help? Contact us at <a href="mailto:support@daylight.com" class="footer-link">support@daylight.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    
    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Thank you for registering with DayLight. We're excited to have you join our community.</p>
        <p class="text">To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
        
        <div class="button-container">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>

        <div class="link-fallback">
          <p class="link-fallback-text">If the button doesn't work, copy and paste this link into your browser:</p>
          <a href="${verificationUrl}" class="link">${verificationUrl}</a>
        </div>

        <div class="alert-box alert-info">
          <strong>Important:</strong> This verification link will expire in 24 hours for security purposes.
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">If you didn't create an account with DayLight, please disregard this email.</p>
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
        <p class="text">We received a request to reset your password for your DayLight account.</p>
        <p class="text">To create a new password, click the button below:</p>
        
        <div class="button-container">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>

        <div class="link-fallback">
          <p class="link-fallback-text">If the button doesn't work, copy and paste this link into your browser:</p>
          <a href="${resetUrl}" class="link">${resetUrl}</a>
        </div>

        <div class="alert-box alert-warning">
          <strong>Security Notice:</strong> This password reset link will expire in 1 hour.
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
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
        <p class="text">Your email has been successfully verified. We're thrilled to have you as part of our community.</p>
        
        <div class="info-box">
          <h3 class="info-box-title">Your Personality Profile</h3>
          <div class="info-row">
            <span class="info-label">Personality Type</span>
            <span class="info-value">${archetype}</span>
          </div>
        </div>

        <div class="alert-box alert-success">
          <strong>Assessment Complete:</strong> You've completed your personality assessment. We'll use this to connect you with like-minded individuals at DayLight gatherings.
        </div>

        <p class="text">Get ready to experience meaningful connections and discover new friendships at your next DayLight event.</p>

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

  // PAYMENT NOTIFICATION EMAILS

  async sendPaymentCreatedEmail(
    email: string,
    name: string,
    transaction: any,
    event: any,
  ) {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(date));
    };

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Thank you for booking <strong>${event.title}</strong>. Your payment is currently pending.</p>
        
        <div class="info-box">
          <h3 class="info-box-title">Event Information</h3>
          <div class="info-row">
            <span class="info-label">Event Name</span>
            <span class="info-value">${event.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date & Time</span>
            <span class="info-value">${formatDate(event.eventDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location</span>
            <span class="info-value">${event.venue}, ${event.city}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Payment Details</h3>
          <div class="info-row">
            <span class="info-label">Invoice Number</span>
            <span class="info-value">${transaction.merchantRef}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">${transaction.paymentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Amount</span>
            <span class="info-value">${formatCurrency(transaction.amount + transaction.feeCustomer)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Expires</span>
            <span class="info-value">${formatDate(transaction.expiredAt)}</span>
          </div>
        </div>

        ${transaction.payCode ? `
        <div class="payment-code-box">
          <p class="payment-code-label">Payment Code</p>
          <div class="payment-code">${transaction.payCode}</div>
        </div>
        ` : ''}

        <div class="alert-box alert-warning">
          <strong>Action Required:</strong> Please complete your payment before ${formatDate(transaction.expiredAt)} to secure your spot at this event.
        </div>

        ${transaction.checkoutUrl ? `
        <div class="button-container">
          <a href="${transaction.checkoutUrl}" class="button">Complete Payment</a>
        </div>
        ` : ''}
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Pending - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  async sendPaymentSuccessEmail(
    email: string,
    name: string,
    transaction: any,
    event: any,
  ) {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(date));
    };

    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Great news! Your payment has been successfully processed. You're all set for <strong>${event.title}</strong>.</p>
        
        <div class="alert-box alert-success">
          <strong>Registration Confirmed:</strong> Your spot at this event has been secured.
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Event Information</h3>
          <div class="info-row">
            <span class="info-label">Event Name</span>
            <span class="info-value">${event.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date & Time</span>
            <span class="info-value">${formatDate(event.eventDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location</span>
            <span class="info-value">${event.venue}, ${event.city}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 class="info-box-title">Payment Summary</h3>
          <div class="info-row">
            <span class="info-label">Invoice Number</span>
            <span class="info-value">${transaction.merchantRef}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">${transaction.paymentName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Amount Paid</span>
            <span class="info-value">${formatCurrency(transaction.amount + transaction.feeCustomer)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Date</span>
            <span class="info-value">${formatDate(transaction.paidAt)}</span>
          </div>
        </div>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/my-events" class="button">View My Events</a>
        </div>

        <div class="divider"></div>

        <p class="text"><strong>What's Next?</strong></p>
        <ul class="list">
          <li class="list-item">Mark your calendar for ${formatDate(event.eventDate)}</li>
          <li class="list-item">You'll receive event details and reminders closer to the date</li>
          <li class="list-item">Check your DayLight dashboard for updates and announcements</li>
        </ul>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Successful - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  async sendPaymentExpiredEmail(
    email: string,
    name: string,
    transaction: any,
    event: any,
  ) {
    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">Your payment for <strong>${event.title}</strong> has expired.</p>
        
        <div class="alert-box alert-warning">
          <strong>Payment Expired:</strong> Invoice #${transaction.merchantRef} is no longer valid and cannot be processed.
        </div>

        <p class="text">Don't worry! You can still attend this event by creating a new booking. Simply visit the event page and complete a new registration.</p>

        <div class="button-container">
          <a href="${this.configService.get('FRONTEND_URL')}/events/${event.slug}" class="button">Book Again</a>
        </div>

        <div class="divider"></div>

        <p class="text" style="font-size: 13px; color: #999;">If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Expired - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }

  async sendPaymentFailedEmail(
    email: string,
    name: string,
    transaction: any,
    event: any,
  ) {
    const content = `
      <div class="email-body">
        <h2 class="greeting">Hello ${name},</h2>
        <p class="text">We're sorry, but your payment for <strong>${event.title}</strong> could not be processed.</p>
        
        <div class="alert-box alert-error">
          <strong>Payment Failed:</strong> Invoice #${transaction.merchantRef} was not successfully processed.
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

        <p class="text" style="font-size: 13px; color: #999;">We're here to help. If you continue experiencing issues, please contact our support team and we'll assist you with your booking.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Failed - ${event.title}`,
      html: this.getEmailTemplate(content),
    });
  }
}