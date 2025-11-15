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

  async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Verify Your DayLight Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5005; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #FF5005; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Welcome to DayLight!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for registering with DayLight! We're excited to have you join our community.</p>
              <p>To complete your registration, please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #FF5005;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with DayLight, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendResetPasswordEmail(email: string, token: string, name: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Reset Your DayLight Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5005; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #FF5005; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 DayLight</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #FF5005;">${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string, archetype: string) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Welcome to DayLight! ☀️',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5005; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .archetype-box { background-color: white; padding: 20px; border-left: 4px solid #FF5005; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Your Email is Verified!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Your email has been successfully verified! Welcome to DayLight! 🎉</p>
              <div class="archetype-box">
                <h3>Your Personality Type: ${archetype}</h3>
                <p>You've completed your personality assessment, and we can't wait to connect you with like-minded people!</p>
              </div>
              <p>Get ready to experience meaningful connections at your next DayLight gathering.</p>
              <p>See you soon! ☀️</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Pending - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5005; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { text-align: right; }
            .payment-code { background-color: #FFF3E0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #FF5005; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; background-color: #FF5005; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #FFF9C4; padding: 15px; border-left: 4px solid #FFC107; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Payment Pending</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for booking <strong>${event.title}</strong>! Your payment is pending.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #FF5005;">Event Details</h3>
                <div class="info-row">
                  <span class="info-label">Event:</span>
                  <span class="info-value">${event.title}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${formatDate(event.eventDate)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Venue:</span>
                  <span class="info-value">${event.venue}, ${event.city}</span>
                </div>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #FF5005;">Payment Details</h3>
                <div class="info-row">
                  <span class="info-label">Invoice Number:</span>
                  <span class="info-value">${transaction.merchantRef}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${transaction.paymentName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Amount:</span>
                  <span class="info-value">${formatCurrency(transaction.amount + transaction.feeCustomer)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Expires:</span>
                  <span class="info-value">${formatDate(transaction.expiredAt)}</span>
                </div>
              </div>

              ${transaction.payCode ? `
              <div class="payment-code">
                Payment Code: ${transaction.payCode}
              </div>
              ` : ''}

              <div class="warning">
                <strong>⏰ Important:</strong> Please complete your payment before ${formatDate(transaction.expiredAt)} to secure your spot!
              </div>

              ${transaction.checkoutUrl ? `
              <div style="text-align: center;">
                <a href="${transaction.checkoutUrl}" class="button">Complete Payment</a>
              </div>
              ` : ''}

              <p>Need help? Contact us at support@daylight.com</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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

    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Successful - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
            .info-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { text-align: right; }
            .button { display: inline-block; background-color: #FF5005; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .highlight { background-color: #E8F5E9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Successful!</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              
              <h2>Hi ${name},</h2>
              <p>Great news! Your payment has been confirmed. You're all set for <strong>${event.title}</strong>!</p>
              
              <div class="highlight">
                <strong>🎫 Your spot is confirmed!</strong> We can't wait to see you at the event.
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #4CAF50;">Event Details</h3>
                <div class="info-row">
                  <span class="info-label">Event:</span>
                  <span class="info-value">${event.title}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${formatDate(event.eventDate)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Venue:</span>
                  <span class="info-value">${event.venue}, ${event.city}</span>
                </div>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #4CAF50;">Payment Summary</h3>
                <div class="info-row">
                  <span class="info-label">Invoice Number:</span>
                  <span class="info-value">${transaction.merchantRef}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Method:</span>
                  <span class="info-value">${transaction.paymentName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Amount Paid:</span>
                  <span class="info-value">${formatCurrency(transaction.amount + transaction.feeCustomer)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${formatDate(transaction.paidAt)}</span>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL')}/my-events" class="button">View My Events</a>
              </div>

              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Mark your calendar for ${formatDate(event.eventDate)}</li>
                <li>You'll receive event details and reminders closer to the date</li>
                <li>Check your DayLight dashboard for updates</li>
              </ul>

              <p>Questions? Contact us at support@daylight.com</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPaymentExpiredEmail(
    email: string,
    name: string,
    transaction: any,
    event: any,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Expired - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #FF5005; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #FFF9C4; padding: 15px; border-left: 4px solid #FF9800; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Payment Expired</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Unfortunately, your payment for <strong>${event.title}</strong> has expired.</p>
              
              <div class="warning">
                <strong>Invoice #${transaction.merchantRef}</strong> has expired and is no longer valid.
              </div>

              <p>Don't worry! You can still join this event by creating a new booking:</p>

              <div style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL')}/events/${event.slug}" class="button">Book Again</a>
              </div>

              <p>Need help? Contact us at support@daylight.com</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPaymentFailedEmail(
    email: string,
    name: string,
    transaction: any,
    event: any,
  ) {
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Payment Failed - ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F44336; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #FF5005; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .error { background-color: #FFEBEE; padding: 15px; border-left: 4px solid #F44336; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Payment Failed</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We're sorry, but your payment for <strong>${event.title}</strong> has failed.</p>
              
              <div class="error">
                <strong>Invoice #${transaction.merchantRef}</strong> could not be processed.
              </div>

              <p><strong>What can you do?</strong></p>
              <ul>
                <li>Check your payment method and try again</li>
                <li>Use a different payment method</li>
                <li>Contact your bank if the issue persists</li>
              </ul>

              <div style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL')}/events/${event.slug}" class="button">Try Again</a>
              </div>

              <p>Need help? Contact us at support@daylight.com</p>
            </div>
            <div class="footer">
              <p>© 2025 DayLight. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}