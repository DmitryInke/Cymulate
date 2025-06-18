import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PhishingService } from './phishing.service';
import { CreatePhishingAttemptDto } from './dto/create-phishing-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/skip-auth.decorator';

@Controller('phishing')
@UseGuards(JwtAuthGuard)
export class PhishingController {
  constructor(private readonly phishingService: PhishingService) {}

  @Post('attempts')
  async createAttempt(
    @Body() createPhishingAttemptDto: CreatePhishingAttemptDto,
    @Request() req: any,
  ) {
    return this.phishingService.createAttempt(
      createPhishingAttemptDto,
      req.user.id,
    );
  }

  @Post('attempts/:id/send')
  async sendPhishingEmail(@Param('id') id: string) {
    try {
      return await this.phishingService.sendPhishingEmail(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('attempts')
  async getAllAttempts(@Request() req: any) {
    return this.phishingService.getAllAttempts(req.user.id);
  }

  @Get('attempts/:id')
  async getAttempt(@Param('id') id: string, @Request() req: any) {
    return this.phishingService.getAttemptById(id, req.user.id);
  }

  /**
   * Public endpoint for tracking phishing link clicks
   * No authentication required - called from email links
   *
   * @param attemptId - MongoDB ObjectId of the phishing attempt
   * @returns Promise<PhishingAttempt> - Updated attempt with clicked status
   */
  @Public() // Skip JWT authentication for this endpoint
  @Get('click/:attemptId')
  async trackClick(@Param('attemptId') attemptId: string) {
    return this.phishingService.markAsClicked(attemptId);
  }
}
