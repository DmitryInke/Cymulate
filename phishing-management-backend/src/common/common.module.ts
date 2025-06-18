import { Module } from '@nestjs/common';
import { TcpClientService } from './services/tcp-client.service';

/**
 * Common module providing shared services across the application
 * 
 * Features:
 * - TCP client service for microservice communication
 * - Shared DTOs and utilities
 * - Cross-cutting concerns
 */
@Module({
  providers: [TcpClientService],
  exports: [TcpClientService],
})
export class CommonModule {} 