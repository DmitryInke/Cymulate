import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,

  AppBar,
  Toolbar,
  IconButton,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import { 
  Logout as LogoutIcon, 
  Send as SendIcon, 
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { phishingAPI } from '../services/api';
import { PhishingAttempt, CreatePhishingAttemptDto, EmailTemplate } from '../types';

const PhishingSimulationPage: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  
  const [attempts, setAttempts] = useState<PhishingAttempt[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const { user, logout } = useAuth();

  // Memoized functions to prevent unnecessary re-renders and duplicate calls
  const loadAttempts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await phishingAPI.getAll();
      setAttempts(data);
    } catch (err: any) {
      setError('Failed to load phishing attempts');
    } finally {
      if (showRefreshing) setIsRefreshing(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await phishingAPI.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
    }
  }, []);

  // Initial data loading - only once when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // Load both attempts and templates in parallel
        await Promise.all([
          loadAttempts(false),
          loadTemplates()
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [loadAttempts, loadTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!recipientEmail) {
      setError('Please enter recipient email');
      setIsLoading(false);
      return;
    }

    if (!selectedTemplate) {
      setError('Please select a template');
      setIsLoading(false);
      return;
    }

    try {
      const newAttempt: CreatePhishingAttemptDto = {
        recipientEmail,
        subject: emailSubject,
        emailContent,
      };

      const createdAttempt = await phishingAPI.create(newAttempt);
      
      // Send the email immediately after creating the attempt
      await phishingAPI.sendEmail(createdAttempt.id);
      
      setSuccess('Phishing email sent successfully!');
      setRecipientEmail('');
      setSelectedTemplate('');
      
      // Reload attempts to show the new one
      await loadAttempts(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send phishing email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  }, [templates]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    loadAttempts(true);
  }, [loadAttempts]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'sent':
        return 'primary';
      case 'clicked':
        return 'error';
      case 'failed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳ Pending';
      case 'sent':
        return '📧 Sent';
      case 'clicked':
        return '🎯 Clicked';
      case 'failed':
        return '❌ Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show loading state during initial load
  if (isInitialLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6" color="text.secondary">
            📊 Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Phishing Simulation Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Create Phishing Attempt Form */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Create Phishing Attempt
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Recipient Email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                margin="normal"
                required
                type="email"
              />

              {/* Template Selection */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  📝 Choose Email Template
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select a pre-made phishing simulation template
                </Typography>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 2, 
                  mt: 2 
                }}>
                  {/* Template Options */}
                  {templates.map((template) => (
                    <Card 
                      key={template.id}
                      sx={{ 
                        height: 140,
                        cursor: 'pointer',
                        border: selectedTemplate === template.id ? '2px solid #1976d2' : '1px solid #ddd',
                        backgroundColor: selectedTemplate === template.id ? '#e3f2fd' : 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': { 
                          boxShadow: 3,
                          borderColor: '#1976d2'
                        }
                      }}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Typography variant="h5">
                            {template.category === 'security' && '🔒'}
                            {template.category === 'social' && '👥'}
                            {template.category === 'urgency' && '⚡'}
                            {template.category === 'reward' && '🎁'}
                          </Typography>
                          <Chip 
                            label={template.category}
                            size="small"
                            color={
                              template.category === 'security' ? 'error' :
                              template.category === 'social' ? 'info' :
                              template.category === 'urgency' ? 'warning' : 'success'
                            }
                            variant="outlined"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {!selectedTemplate && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Please select a template above to continue
                  </Alert>
                )}
              </Box>

              {/* Template Preview */}
              {selectedTemplate && (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mt: 2, 
                    backgroundColor: '#f8f9fa',
                    border: '2px solid #e3f2fd'
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="h6" color="primary">
                        📧 Email Preview
                      </Typography>
                      <Chip 
                        label={templates.find(t => t.id === selectedTemplate)?.category}
                        color="primary"
                        size="small"
                        variant="outlined"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {templates.find(t => t.id === selectedTemplate)?.description}
                    </Typography>

                    {/* Email Header Simulation */}
                    <Box 
                      sx={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: 2,
                        overflow: 'hidden',
                        mt: 2
                      }}
                    >
                      {/* Email Client Header */}
                      <Box 
                        sx={{ 
                          backgroundColor: '#f5f5f5',
                          p: 2,
                          borderBottom: '1px solid #ddd'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          From: phishing-test@example.com
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          To: {recipientEmail ? (
                            <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                              {recipientEmail}
                            </span>
                          ) : (
                            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>
                              [Enter recipient email above]
                            </span>
                          )}
                        </Typography>
                        <br />
                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                          Subject: {emailSubject}
                        </Typography>
                      </Box>

                      {/* Email Body */}
                      <Box 
                        sx={{ 
                          p: 3,
                          minHeight: 400,
                          maxHeight: 500,
                          overflow: 'auto',
                          '& a': {
                            color: '#1976d2',
                            textDecoration: 'underline',
                            backgroundColor: '#fff3e0',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            border: '1px dashed #ff9800'
                          },
                          '& a:after': {
                            content: '" 🎯"',
                            fontSize: '0.8em'
                          }
                        }}
                        dangerouslySetInnerHTML={{ 
                          __html: emailContent.replace(/\{\{CLICK_LINK\}\}/g, '#tracking-link') 
                        }}
                      />
                    </Box>

                    <Alert 
                      severity="info" 
                      icon={false}
                      sx={{ mt: 2, fontSize: '0.875rem' }}
                    >
                      <Typography variant="caption">
                        🎯 Links marked with dashes will be replaced with tracking URLs
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              )}
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  disabled={isLoading || !selectedTemplate}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      boxShadow: '0 6px 10px 2px rgba(25, 118, 210, .3)',
                    },
                    '&:disabled': {
                      background: '#ccc'
                    }
                  }}
                >
                  {isLoading ? '📤 Sending...' : '🚀 Send Phishing Email'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Phishing Attempts Table */}
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                Phishing Attempts
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Recipient Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attempts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No phishing attempts found. Create your first attempt above.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>{attempt.recipientEmail}</TableCell>
                        <TableCell>{attempt.subject}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(attempt.status)}
                            color={getStatusColor(attempt.status) as any}
                            size="small"
                            sx={{ cursor: 'default' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>{formatDate(attempt.createdAt)}</TableCell>
                        <TableCell>{formatDate(attempt.updatedAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default PhishingSimulationPage; 