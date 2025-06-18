import { IsEmail, IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating new phishing attempts
 * Validates input data for phishing simulation creation
 * 
 * Validation rules:
 * - Recipient email must be valid email format
 * - Email content and subject are optional (defaults will be used)
 * - Content and subject have length limits for reasonable email size
 */
export class CreatePhishingAttemptDto {
  /**
   * Target email address for the phishing simulation
   * Must be a valid email format
   * Will be used as the recipient in the phishing email
   */
  @IsEmail({}, { message: 'Please provide a valid recipient email address' })
  recipientEmail: string;

  /**
   * HTML content for the phishing email (optional)
   * - If not provided, default template will be used
   * - Can include {{CLICK_LINK}} placeholder for dynamic link injection
   * - Should contain compelling HTML to encourage clicking
   * - Limited to 10,000 characters for reasonable email size
   */
  @IsOptional()
  @IsString({ message: 'Email content must be a string' })
  @MaxLength(10000, { message: 'Email content cannot exceed 10,000 characters' })
  emailContent?: string;

  /**
   * Email subject line (optional)
   * - If not provided, default subject will be used
   * - Should be crafted to encourage email opening
   * - Limited to 200 characters (typical email client limit)
   */
  @IsOptional()
  @IsString({ message: 'Subject must be a string' })
  @MaxLength(200, { message: 'Subject cannot exceed 200 characters' })
  @MinLength(1, { message: 'Subject cannot be empty if provided' })
  subject?: string;
}

/**
 * Data Transfer Object for sending phishing emails to simulation service
 * Used internally for communication between management and simulation services
 * 
 * Validation rules:
 * - All fields are required for email sending
 * - Recipient email must be valid format
 * - Content and subject must be non-empty strings
 * - Attempt ID must be valid for tracking
 */
 