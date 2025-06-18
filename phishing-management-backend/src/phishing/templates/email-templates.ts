/**
 * Email template system for phishing simulations
 * Provides pre-defined templates and template management functionality
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: 'security' | 'social' | 'urgency' | 'reward' | 'custom';
}

/**
 * Pre-defined email templates for common phishing scenarios
 * These can be used as defaults or examples for users
 */
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'security-verification',
    name: 'Security Verification',
    subject: 'Urgent: Account Verification Required',
    description: 'Classic security alert requiring immediate action',
    category: 'security',
    content: `
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
    `,
  },
  {
    id: 'password-reset',
    name: 'Password Reset Request',
    subject: 'Password Reset - Action Required',
    description: 'Password reset phishing attempt',
    category: 'security',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. If this was you, please click the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{CLICK_LINK}}" style="background-color: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Support Team</p>
      </div>
    `,
  },
  {
    id: 'social-linkedin',
    name: 'LinkedIn Connection',
    subject: 'You have a new connection request',
    description: 'Social engineering via fake LinkedIn notification',
    category: 'social',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0077b5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">LinkedIn</h1>
        </div>
        <div style="padding: 20px;">
          <h2>You have a new connection request</h2>
          <p>Hi there,</p>
          <p>John Smith wants to connect with you on LinkedIn.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{CLICK_LINK}}" style="background-color: #0077b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Profile</a>
          </div>
          <p>Best regards,<br>The LinkedIn Team</p>
        </div>
      </div>
    `,
  },
  {
    id: 'urgent-invoice',
    name: 'Urgent Invoice Payment',
    subject: 'URGENT: Invoice Payment Overdue',
    description: 'Urgent payment request to create panic',
    category: 'urgency',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">⚠️ URGENT: Payment Overdue</h2>
        <p>Dear Customer,</p>
        <p><strong>Invoice #INV-2024-001 is now 30 days overdue.</strong></p>
        <p>Amount due: <span style="color: #f44336; font-weight: bold;">$1,247.50</span></p>
        <p>To avoid additional fees and service suspension, please pay immediately:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{CLICK_LINK}}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">PAY NOW</a>
        </div>
        <p>Failure to pay within 24 hours will result in additional charges.</p>
        <p>Billing Department</p>
      </div>
    `,
  },
  {
    id: 'reward-survey',
    name: 'Survey Reward',
    subject: 'Congratulations! You\'ve won a $500 gift card',
    description: 'Fake reward to entice clicks',
    category: 'reward',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(45deg, #ff9800, #ffeb3b); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 CONGRATULATIONS! 🎉</h1>
        </div>
        <div style="padding: 20px;">
          <h2>You've won a $500 Amazon Gift Card!</h2>
          <p>You've been selected as our lucky winner!</p>
          <p>Complete a quick 2-minute survey to claim your prize:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{CLICK_LINK}}" style="background-color: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px;">CLAIM YOUR PRIZE</a>
          </div>
          <p style="color: #666; font-size: 12px;">Offer expires in 24 hours. Must be 18+ to participate.</p>
        </div>
      </div>
    `,
  },
];

/**
 * Template service for managing email templates
 */
export class TemplateService {
  /**
   * Get all available templates
   */
  static getAllTemplates(): EmailTemplate[] {
    return EMAIL_TEMPLATES;
  }

  /**
   * Get default template (fallback)
   */
  static getDefaultTemplate(): EmailTemplate {
    return EMAIL_TEMPLATES[0]; // Security verification as default
  }

  /**
   * Validate template content (ensure it has required placeholders)
   */
  static validateTemplate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!content.includes('{{CLICK_LINK}}')) {
      errors.push('Template must include {{CLICK_LINK}} placeholder');
    }
    
    if (content.length > 50000) {
      errors.push('Template content too large (max 50KB)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
} 