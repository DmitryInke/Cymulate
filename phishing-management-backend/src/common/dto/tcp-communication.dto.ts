import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for sending phishing emails via TCP
 * Synchronized with Simulation service DTOs for consistent communication
 */
export class SendPhishingEmailDto {
  @IsEmail({}, { message: 'Please provide a valid recipient email address' })
  recipientEmail: string;

  @IsString({ message: 'Email content must be a string' })
  @MinLength(1, { message: 'Email content cannot be empty' })
  emailContent: string;

  @IsString({ message: 'Subject must be a string' })
  @MinLength(1, { message: 'Subject cannot be empty' })
  subject: string;

  @IsString({ message: 'Attempt ID must be a string' })
  @MinLength(1, { message: 'Attempt ID cannot be empty' })
  attemptId: string;
}

/**
 * Response interface for TCP email sending operations
 * Matches the response format from Simulation service
 */
export interface SendEmailResponse {
  success: boolean;
  message: string;
  sentAt?: Date;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * TCP message patterns for microservice communication
 * Must match patterns defined in Simulation service
 */
export const TCP_PATTERNS = {
  SEND_PHISHING_EMAIL: 'send_phishing_email',
  HEALTH_CHECK: 'health_check',
} as const; 