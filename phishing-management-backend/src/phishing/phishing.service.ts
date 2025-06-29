import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhishingAttempt, PhishingAttemptDocument, PhishingStatus } from './phishing-attempt.schema';
import { CreatePhishingAttemptDto } from './dto/create-phishing-attempt.dto';
import { TcpClientService } from '../common/services/tcp-client.service';
import { SendPhishingEmailDto } from '../common/dto/tcp-communication.dto';
import { TemplateService, EmailTemplate } from './templates/email-templates';

@Injectable()
export class PhishingService {
  constructor(
    @InjectModel(PhishingAttempt.name) 
    private readonly phishingAttemptModel: Model<PhishingAttemptDocument>,
    private readonly tcpClientService: TcpClientService,
  ) {}

  async createAttempt(
    createPhishingAttemptDto: CreatePhishingAttemptDto,
    userId: string,
  ): Promise<PhishingAttempt> {
    // Use default template if content/subject not provided
    const defaultTemplate = TemplateService.getDefaultTemplate();

    // Validate custom content if provided
    if (createPhishingAttemptDto.emailContent) {
      const validation = TemplateService.validateTemplate(createPhishingAttemptDto.emailContent);
      if (!validation.valid) {
        throw new BadRequestException(`Invalid email template: ${validation.errors.join(', ')}`);
      }
    }

    const phishingAttempt = new this.phishingAttemptModel({
      recipientEmail: createPhishingAttemptDto.recipientEmail,
      emailContent: createPhishingAttemptDto.emailContent || defaultTemplate.content,
      subject: createPhishingAttemptDto.subject || defaultTemplate.subject,
      createdBy: userId,
      status: PhishingStatus.PENDING,
    });

    return phishingAttempt.save();
  }

  async sendPhishingEmail(attemptId: string): Promise<PhishingAttempt> {
    const attempt = await this.phishingAttemptModel.findById(attemptId);
    
    if (!attempt) {
      throw new NotFoundException('Phishing attempt not found');
    }

    if (attempt.status !== PhishingStatus.PENDING) {
      throw new BadRequestException('Phishing attempt has already been processed');
    }

    try {
      // Prepare data for simulation service via TCP
      const sendEmailDto: SendPhishingEmailDto = {
        recipientEmail: attempt.recipientEmail,
        emailContent: attempt.emailContent,
        subject: attempt.subject,
        attemptId: attempt.id!,
      };

      // Send request to phishing simulation service via TCP
      const response = await this.tcpClientService.sendPhishingEmail(sendEmailDto);

      if (response.success) {
        // Update attempt status to sent
        attempt.status = PhishingStatus.SENT;
        attempt.sentAt = response.sentAt || new Date();
        
        return attempt.save();
      } else {
        // Update status to failed if TCP response indicates failure
        attempt.status = PhishingStatus.FAILED;
        await attempt.save();
        
        throw new BadRequestException(
          `Failed to send phishing email: ${response.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      // Update status to failed if TCP communication fails
      attempt.status = PhishingStatus.FAILED;
      await attempt.save();
      
      // Re-throw BadRequestException or wrap other errors
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(
        `Failed to communicate with email service: ${error.message}`
      );
    }
  }

  async getAllAttempts(userId: string): Promise<PhishingAttempt[]> {
    return this.phishingAttemptModel
      .find({ createdBy: userId })
      .select('recipientEmail subject status createdAt updatedAt clickedAt sentAt') // Only select needed fields
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsClicked(attemptId: string): Promise<PhishingAttempt> {
    // Use findByIdAndUpdate for atomic operation (more efficient)
    const attempt = await this.phishingAttemptModel.findByIdAndUpdate(
      attemptId,
      {
        $set: {
          status: PhishingStatus.CLICKED,
          clickedAt: new Date(),
        },
      },
      {
        new: true, // Return updated document
        runValidators: true,
      }
    );
    
    if (!attempt) {
      throw new NotFoundException('Phishing attempt not found');
    }

    return attempt;
  }

  /**
   * Get all available email templates
   * @returns Array of EmailTemplate objects
   */
  async getAllTemplates(): Promise<EmailTemplate[]> {
    return TemplateService.getAllTemplates();
  }
} 