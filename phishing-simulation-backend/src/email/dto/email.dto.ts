import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for sending phishing emails via TCP
 * Used for communication between Management and Simulation services
 * 
 * This DTO is sent over TCP when Management service requests email sending
 */
export class SendPhishingEmailDto {
  /**
   * Target email address for the phishing simulation
   * Must be a valid email format
   */
  @IsEmail({}, { message: 'Please provide a valid recipient email address' })
  recipientEmail: string;

  /**
   * HTML content for the phishing email
   * Contains the email body with styling and click tracking placeholder
   */
  @IsString({ message: 'Email content must be a string' })
  @MinLength(1, { message: 'Email content cannot be empty' })
  emailContent: string;

  /**
   * Email subject line
   * Displayed in recipient's email client
   */
  @IsString({ message: 'Subject must be a string' })
  @MinLength(1, { message: 'Subject cannot be empty' })
  subject: string;

  /**
   * MongoDB ObjectId of the phishing attempt
   * Used for generating click tracking links and status updates
   */
  @IsString({ message: 'Attempt ID must be a string' })
  @MinLength(1, { message: 'Attempt ID cannot be empty' })
  attemptId: string;
}

/**
 * Response object for email sending operations
 * Returned by Simulation service to Management service via TCP
 */
export interface SendEmailResponse {
  /** Whether the email was sent successfully */
  success: boolean;
  
  /** Human-readable message about the operation result */
  message: string;
  
  /** Timestamp when the email was sent (if successful) */
  sentAt?: Date;
  
  /** Error details if sending failed */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * TCP message patterns for microservice communication
 * Used by @MessagePattern() decorators in controllers
 */
export const TCP_PATTERNS = {
  /** Pattern for sending phishing emails */
  SEND_PHISHING_EMAIL: 'send_phishing_email',
} as const; 