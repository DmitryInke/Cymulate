import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PhishingService } from './phishing.service';
import { CreatePhishingAttemptDto } from './dto/create-phishing-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

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

  /**
   * Public endpoint for tracking phishing link clicks
   * No authentication required - called from email links
   *
   * @param attemptId - MongoDB ObjectId of the phishing attempt
   * @param res - Response object for redirecting
   * @returns Redirect to frontend phished page
   */
  @Public() // Skip JWT authentication for this endpoint
  @Get('click/:attemptId')
  async trackClick(@Param('attemptId') attemptId: string, @Res() res: Response) {
    try {
      await this.phishingService.markAsClicked(attemptId);
      
      // Redirect to frontend phished page
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/phished/${attemptId}`);
    } catch (error) {
      // Even if tracking fails, still redirect to show the awareness page
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/phished/${attemptId}`);
    }
  }

  /**
   * Get all available email templates
   * @returns Array of email templates with different phishing scenarios
   */
  @Get('templates')
  async getAllTemplates(): Promise<any[]> {
    return this.phishingService.getAllTemplates();
  }
}
