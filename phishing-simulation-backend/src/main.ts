import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap function for Phishing Simulation TCP Microservice
 * Pure TCP microservice for email sending operations
 * 
 * Features:
 * - TCP transport for inter-service communication
 * - Global validation pipes for request validation
 * - Environment-based configuration
 */
async function bootstrap() {
  const logger = new Logger('PhishingSimulationService');
  
  // Create pure TCP microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_HOST || 'localhost',
      port: parseInt(process.env.TCP_PORT || '3333'),
    },
  });

  // Enable global validation for TCP requests
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Start TCP microservice
  await app.listen();
  
  logger.log(`🚀 Phishing Simulation TCP Microservice started:`);
  logger.log(`   📡 TCP Server: ${process.env.TCP_HOST || 'localhost'}:${process.env.TCP_PORT || 3333}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Phishing Simulation Service:', error);
  process.exit(1);
});
