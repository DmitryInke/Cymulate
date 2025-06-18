import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhishingService } from './phishing.service';
import { PhishingController } from './phishing.controller';
import { PhishingAttempt, PhishingAttemptSchema } from './phishing-attempt.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhishingAttempt.name, schema: PhishingAttemptSchema },
    ]),
    CommonModule, // Import CommonModule for TCP client
  ],
  controllers: [PhishingController],
  providers: [PhishingService],
  exports: [PhishingService],
})
export class PhishingModule {} 