import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PhishingAttempt, PhishingAttemptDocument, PhishingStatus } from './phishing-attempt.schema';
import { CreatePhishingAttemptDto } from './dto/create-phishing-attempt.dto';
import { TcpClientService } from '../common/services/tcp-client.service';
import { SendPhishingEmailDto } from '../common/dto/tcp-communication.dto';

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
    // Default email content if not provided
    const defaultSubject = 'Urgent: Account Verification Required';
    const defaultContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Account Verification Required</h2>
        <p>Dear User,</p>
        <p>We've detected unusual activity on your account. Please verify your identity by clicking the link below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{CLICK_LINK}}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a>
        </div>
        <p>If you don't verify within 24 hours, your account will be suspended.</p>
        <p>Best regards,<br>Security Team</p>
      </div>
    `;

    const phishingAttempt = new this.phishingAttemptModel({
      recipientEmail: createPhishingAttemptDto.recipientEmail,
      emailContent: createPhishingAttemptDto.emailContent || defaultContent,
      subject: createPhishingAttemptDto.subject || defaultSubject,
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
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAttemptById(id: string, userId: string): Promise<PhishingAttempt> {
    const attempt = await this.phishingAttemptModel.findOne({ 
      _id: id, 
      createdBy: userId 
    });
    
    if (!attempt) {
      throw new NotFoundException('Phishing attempt not found');
    }
    
    return attempt;
  }

  async markAsClicked(attemptId: string): Promise<PhishingAttempt> {
    const attempt = await this.phishingAttemptModel.findById(attemptId);
    
    if (!attempt) {
      throw new NotFoundException('Phishing attempt not found');
    }

    if (attempt.status === PhishingStatus.CLICKED) {
      return attempt; // Already clicked
    }

    attempt.status = PhishingStatus.CLICKED;
    attempt.clickedAt = new Date();
    
    return attempt.save();
  }
} 