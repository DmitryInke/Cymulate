import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CircularProgress, Box, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PhishingSimulationPage from './pages/PhishingSimulationPage';
import PhishedPage from './pages/PhishedPage';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={3}
      >
        <CircularProgress size={60} thickness={4} />
        <Box textAlign="center">
          <Typography variant="h6" color="primary" gutterBottom>
            Phishing Simulation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Checking authentication...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <PhishingSimulationPage />
          </PrivateRoute>
        }
      />
      {/* Public route for phishing click tracking */}
      <Route 
        path="/phished/:attemptId" 
        element={<PhishedPage />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
