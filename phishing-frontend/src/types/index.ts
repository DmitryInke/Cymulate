export interface User {
  id: string;
  email: string;
}

export interface PhishingAttempt {
  id: string;
  recipientEmail: string;
  subject: string;
  emailContent: string;
  status: 'pending' | 'sent' | 'clicked' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface CreatePhishingAttemptDto {
  recipientEmail: string;
  subject: string;
  emailContent: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: 'security' | 'social' | 'urgency' | 'reward' | 'custom';
} 