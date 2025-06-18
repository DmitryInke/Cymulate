import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const PhishedPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [isValidAttempt, setIsValidAttempt] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple validation: check if attemptId exists and looks like a MongoDB ObjectId
    // The click tracking already happened when user was redirected here from /phishing/click/:attemptId
    if (attemptId) {
      // Basic MongoDB ObjectId validation (24 character hex string)
      const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
      if (mongoIdPattern.test(attemptId)) {
        setIsValidAttempt(true);
      } else {
        setIsValidAttempt(false);
      }
    } else {
      setIsValidAttempt(false);
    }
    setIsLoading(false);
  }, [attemptId]);

  // Show loading while validating
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5">Loading...</Typography>
      </Container>
    );
  }

  // Show error if invalid attempt
  if (isValidAttempt === false) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Invalid Link
          </Typography>
          <Typography variant="body1">
            This link is not valid or has expired. If you received this link in an email, 
            please contact your IT security team.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.close()}
          sx={{ mt: 2 }}
        >
          Close Window
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        {/* Warning Header */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            backgroundColor: '#fff3e0',
            border: '2px solid #ff9800',
            borderRadius: 3
          }}
        >
          <WarningIcon sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom color="#e65100">
            🎯 You've Been Phished!
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            This was a phishing simulation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Don't worry - this was just a training exercise to help you recognize phishing attempts.
          </Typography>
        </Paper>
      </Box>

      {/* Educational Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* What Happened */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <InfoIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6">What Just Happened?</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              You clicked on a link in a simulated phishing email. In a real attack, this could have:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Stolen your login credentials" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Installed malware on your device" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Compromised your personal information" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Given attackers access to your accounts" />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Red Flags */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon sx={{ color: '#d32f2f', mr: 1 }} />
              <Typography variant="h6">Red Flags to Watch For</Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Urgent language and pressure tactics"
                  secondary="'Act now or your account will be suspended!'"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Suspicious sender addresses"
                  secondary="Check if the email comes from a legitimate domain"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generic greetings"
                  secondary="'Dear Customer' instead of your actual name"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Suspicious links"
                  secondary="Hover over links to see where they really lead"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Unexpected attachments"
                  secondary="Don't open attachments from unknown sources"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* What to Do Next */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <CheckIcon sx={{ color: '#2e7d32', mr: 1 }} />
              <Typography variant="h6">What Should You Do Next Time?</Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6">1️⃣</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Pause and think"
                  secondary="Don't rush to click links or provide information"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6">2️⃣</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Verify the sender"
                  secondary="Contact the organization directly through official channels"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6">3️⃣</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Check URLs carefully"
                  secondary="Hover over links to see the real destination"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Typography variant="h6">4️⃣</Typography>
                </ListItemIcon>
                <ListItemText 
                  primary="Report suspicious emails"
                  secondary="Forward phishing attempts to your IT security team"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Encouragement */}
        <Alert severity="success">
          <Typography variant="h6" gutterBottom>
            🎓 Learning Opportunity!
          </Typography>
          <Typography variant="body1">
            The good news is that this was just a simulation! Use this experience to be more 
            vigilant in the future. Everyone can fall for phishing attacks - the key is to 
            learn from these exercises and develop better security habits.
          </Typography>
        </Alert>

        {/* Back Button */}
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => window.close()}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)',
              }
            }}
          >
            I Understand - Close This Window
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PhishedPage; 