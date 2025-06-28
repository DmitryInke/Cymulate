import axios from 'axios';
import { PhishingAttempt, CreatePhishingAttemptDto, EmailTemplate } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add response interceptor to handle 401 errors (invalid/expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Phishing API
export const phishingAPI = {
  getAll: async (): Promise<PhishingAttempt[]> => {
    const response = await api.get('/phishing/attempts');
    return response.data;
  },

  create: async (data: CreatePhishingAttemptDto): Promise<PhishingAttempt> => {
    const response = await api.post('/phishing/attempts', data);
    return response.data;
  },

  sendEmail: async (id: string): Promise<void> => {
    await api.post(`/phishing/attempts/${id}/send`);
  },

  // Template API
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get('/phishing/templates');
    return response.data;
  },
};

export default api; 