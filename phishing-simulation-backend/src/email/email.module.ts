import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

/**
 * Email module for phishing simulation service
 * Provides email sending capabilities via TCP microservice communication
 * 
 * Features:
 * - EmailService for SMTP email sending
 * - EmailController for TCP message handling
 * - Integration with Nodemailer for email delivery
 */
@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // Export for potential use in other modules
})
export class EmailModule {} 