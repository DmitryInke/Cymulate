import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendPhishingEmailDto, SendEmailResponse } from './dto/email.dto';

/**
 * Email service responsible for sending phishing simulation emails
 * Uses Nodemailer with SMTP configuration for email delivery
 * 
 * Features:
 * - SMTP email sending with configuration from environment
 * - Click tracking link injection into email content
 * - Error handling and detailed response reporting
 * - Template processing for dynamic content
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initializes Nodemailer SMTP transporter with environment configuration
   * Sets up authentication and connection settings for email sending
   */
  private initializeTransporter(): void {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    
    // Configure transporter with optional authentication (for MailHog compatibility)
    const transportConfig: any = {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      // Additional SMTP options for reliability
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    };

    // Only add auth if credentials are provided (MailHog doesn't need auth)
    if (emailUser && emailPass) {
      transportConfig.auth = {
        user: emailUser,
        pass: emailPass,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);

    // Verify SMTP connection on startup
    this.verifyConnection();
  }

  /**
   * Verifies SMTP connection to ensure email service is ready
   * Logs connection status for debugging
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection failed:', error);
    }
  }

  /**
   * Sends a phishing simulation email to the specified recipient
   * 
   * @param emailData - Email content and recipient information
   * @returns Promise<SendEmailResponse> - Success/failure result with details
   * 
   * Process:
   * 1. Generate click tracking link for the attempt
   * 2. Process email content by replacing placeholders
   * 3. Send email via SMTP transporter
   * 4. Return success/failure response with timestamp
   */
  async sendPhishingEmail(emailData: SendPhishingEmailDto): Promise<SendEmailResponse> {
    try {
      this.logger.log(`Sending phishing email to: ${emailData.recipientEmail}`);

      // Generate click tracking link
      const clickTrackingUrl = this.generateClickTrackingUrl(emailData.attemptId);
      
      // Process email content by replacing placeholders
      const processedContent = this.processEmailContent(
        emailData.emailContent,
        clickTrackingUrl,
      );

      // Prepare email options
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: emailData.recipientEmail,
        subject: emailData.subject,
        html: processedContent,
        // Add text version for better deliverability
        text: this.htmlToText(processedContent),
      };

      // Send email via SMTP
      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully. Message ID: ${result.messageId}`);

      return {
        success: true,
        message: 'Phishing email sent successfully',
        sentAt: new Date(),
      };

    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.recipientEmail}:`, error);

      return {
        success: false,
        message: 'Failed to send phishing email',
        error: {
          code: error.code || 'SMTP_ERROR',
          message: error.message,
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      };
    }
  }

  /**
   * Generates click tracking URL for phishing attempt monitoring
   * 
   * @param attemptId - MongoDB ObjectId of the phishing attempt
   * @returns string - Full URL for click tracking
   * 
   * This URL will be called when recipient clicks any link in the email
   * It points back to the Management service's public click tracking endpoint
   */
  private generateClickTrackingUrl(attemptId: string): string {
    const baseUrl = this.configService.get<string>('CLICK_TRACKING_BASE_URL');
    return `${baseUrl}/${attemptId}`;
  }

  /**
   * Processes email content by replacing placeholders with actual values
   * 
   * @param content - Raw HTML email content with placeholders
   * @param clickUrl - Generated click tracking URL
   * @returns string - Processed HTML content with replaced placeholders
   * 
   * Supported placeholders:
   * - {{CLICK_LINK}} - Replaced with click tracking URL
   * - Future: {{RECIPIENT_NAME}}, {{COMPANY_NAME}}, etc.
   */
  private processEmailContent(content: string, clickUrl: string): string {
    return content
      .replace(/\{\{CLICK_LINK\}\}/g, clickUrl)
      // Add more placeholder replacements as needed
      .replace(/\{\{TIMESTAMP\}\}/g, new Date().toLocaleString());
  }

  /**
   * Converts HTML content to plain text for email accessibility
   * Provides fallback text version for recipients who can't view HTML
   * 
   * @param html - HTML email content
   * @returns string - Plain text version of the content
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  /**
   * Health check method for service monitoring
   * Verifies SMTP connection and service readiness
   * 
   * @returns Promise<boolean> - true if service is healthy, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
} 