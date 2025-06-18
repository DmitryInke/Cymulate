import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { SendPhishingEmailDto, SendEmailResponse, TCP_PATTERNS } from './dto/email.dto';

/**
 * Email controller for TCP microservice communication
 * Handles incoming requests from Management service via TCP transport
 * 
 * Features:
 * - TCP message pattern handling for email operations
 * - Payload validation and processing
 * - Error handling for microservice communication
 * - Health check endpoints for service monitoring
 */
@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Handles phishing email sending requests via TCP
   * 
   * @param data - Email sending request data from Management service
   * @returns Promise<SendEmailResponse> - Success/failure response
   * 
   * This method is called when Management service sends a TCP message
   * with pattern 'send_phishing_email'
   * 
   * Process:
   * 1. Log incoming request for debugging
   * 2. Validate payload data
   * 3. Delegate email sending to EmailService
   * 4. Return response to Management service
   */
  @MessagePattern(TCP_PATTERNS.SEND_PHISHING_EMAIL)
  async handleSendPhishingEmail(
    @Payload() data: SendPhishingEmailDto,
  ): Promise<SendEmailResponse> {
    this.logger.log(`Received TCP request to send phishing email to: ${data.recipientEmail}`);
    
    try {
      // Delegate email sending to EmailService
      const result = await this.emailService.sendPhishingEmail(data);
      
      // Log result for monitoring
      if (result.success) {
        this.logger.log(`Successfully processed email request for attempt: ${data.attemptId}`);
      } else {
        this.logger.warn(`Failed to process email request for attempt: ${data.attemptId}`, result.error);
      }
      
      return result;
      
    } catch (error) {
      this.logger.error(`Unexpected error processing email request:`, error);
      
      // Return structured error response
      return {
        success: false,
        message: 'Unexpected error occurred while processing email request',
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      };
    }
  }

  /**
   * Handles health check requests via TCP
   * 
   * @returns Promise<object> - Service health status
   * 
   * This endpoint allows Management service to verify that
   * Simulation service is running and ready to process requests
   */
  @MessagePattern(TCP_PATTERNS.HEALTH_CHECK)
  async handleHealthCheck(): Promise<{ status: string; timestamp: Date; emailServiceReady: boolean }> {
    this.logger.log('Received health check request via TCP');
    
    try {
      const emailServiceReady = await this.emailService.healthCheck();
      
      return {
        status: emailServiceReady ? 'healthy' : 'degraded',
        timestamp: new Date(),
        emailServiceReady,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        emailServiceReady: false,
      };
    }
  }
} 