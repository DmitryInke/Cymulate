import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import { SendPhishingEmailDto, SendEmailResponse, TCP_PATTERNS } from '../dto/tcp-communication.dto';

/**
 * TCP Client service for communication with Phishing Simulation microservice
 * Handles TCP connections and message sending to the Simulation service
 * 
 * Features:
 * - Automatic connection management with retry logic
 * - Timeout handling for TCP requests
 * - Error handling and logging
 */
@Injectable()
export class TcpClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TcpClientService.name);
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.initializeClient();
  }

  /**
   * Initializes TCP client connection to Simulation service
   * Uses environment configuration for connection details
   */
  private initializeClient(): void {
    const tcpHost = this.configService.get<string>('TCP_HOST', 'localhost');
    const tcpPort = this.configService.get<number>('TCP_PORT', 3333);

    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: tcpHost,
        port: tcpPort,
      },
    });

    this.logger.log(`TCP Client initialized for ${tcpHost}:${tcpPort}`);
  }

  /**
   * Connects TCP client when module initializes
   * Establishes connection to Simulation service
   */
  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('TCP Client connected to Simulation service');
    } catch (error) {
      this.logger.error('Failed to connect TCP client:', error);
    }
  }

  /**
   * Closes TCP client connection when module destroys
   * Ensures clean shutdown of TCP connections
   */
  async onModuleDestroy() {
    try {
      await this.client.close();
      this.logger.log('TCP Client disconnected');
    } catch (error) {
      this.logger.error('Error closing TCP client:', error);
    }
  }

  /**
   * Sends phishing email request to Simulation service via TCP
   * 
   * @param emailData - Email content and recipient information
   * @returns Promise<SendEmailResponse> - Success/failure response from Simulation service
   * 
   * Features:
   * - 30-second timeout for TCP requests
   * - Automatic error handling and logging
   * - Structured response format
   */
  async sendPhishingEmail(emailData: SendPhishingEmailDto): Promise<SendEmailResponse> {
    try {
      this.logger.log(`Sending TCP request to send email to: ${emailData.recipientEmail}`);

      // Send TCP message with timeout
      const response = await firstValueFrom(
        this.client
          .send<SendEmailResponse>(TCP_PATTERNS.SEND_PHISHING_EMAIL, emailData)
          .pipe(timeout(30000)) // 30-second timeout
      );

      this.logger.log(`Received TCP response for attempt: ${emailData.attemptId}`, {
        success: response.success,
        message: response.message,
      });

      return response;

    } catch (error) {
      this.logger.error(`TCP request failed for attempt: ${emailData.attemptId}`, error);

      // Return structured error response
      return {
        success: false,
        message: 'Failed to communicate with email service',
        error: {
          code: 'TCP_COMMUNICATION_ERROR',
          message: error.message || 'Unknown TCP error',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      };
    }
  }
} 