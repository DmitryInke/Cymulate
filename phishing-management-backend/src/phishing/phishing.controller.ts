import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
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

  /**
   * Get template by ID
   * @param templateId - Template identifier
   * @returns Single email template or 404 if not found
   */
  @Get('templates/:id')
  async getTemplateById(@Param('id') templateId: string): Promise<any> {
    const template = await this.phishingService.getTemplateById(templateId);
    
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    
    return template;
  }

  /**
   * Get templates by category
   * @param category - Template category (security, social, urgency, reward)
   * @returns Array of templates in the specified category
   */
  @Get('templates/category/:category')
  async getTemplatesByCategory(@Param('category') category: string): Promise<any[]> {
    const validCategories = ['security', 'social', 'urgency', 'reward', 'custom'];
    
    if (!validCategories.includes(category)) {
      throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
    
    return this.phishingService.getTemplatesByCategory(category as any);
  }

  /**
   * API endpoint for tracking phishing link clicks from frontend
   * Returns JSON response for validation
   *
   * @param attemptId - MongoDB ObjectId of the phishing attempt
   * @returns Success/failure status
   */
  @Public()
  @Get('api/click/:attemptId')
  async apiTrackClick(@Param('attemptId') attemptId: string) {
    try {
      await this.phishingService.markAsClicked(attemptId);
      return { success: true, message: 'Click tracked successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Phishing attempt not found');
      }
      throw error;
    }
  }
}
