import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';

/**
 * Main application module for Phishing Simulation TCP Microservice
 * Pure TCP microservice for email sending operations
 * 
 * Features:
 * - Environment configuration with ConfigModule
 * - Email module for SMTP and TCP communication
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EmailModule,
  ],
})
export class AppModule {}
