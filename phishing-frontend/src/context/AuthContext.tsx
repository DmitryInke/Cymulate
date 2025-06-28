import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AuthContextType, User } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use ref to prevent multiple token verification calls
  const isVerifyingToken = useRef(false);

  const verifyStoredToken = useCallback(async () => {
    // Prevent multiple simultaneous verification calls
    if (isVerifyingToken.current) {
      return;
    }
    
    isVerifyingToken.current = true;
    
    try {
      // Try to verify token with backend (token is in HttpOnly cookie)
      const response = await authAPI.verifyToken();
      
      // Token is valid, set user
      setUser(response.user);
      console.log('✅ Token verified successfully');
    } catch (error) {
      // Token is invalid or doesn't exist
      console.warn('⚠️ No valid token found');
      setUser(null);
    } finally {
      setIsLoading(false);
      isVerifyingToken.current = false;
    }
  }, []);

  useEffect(() => {
    // Only verify token if we're not on login/register pages
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      verifyStoredToken();
    } else {
      // On login/register pages, just set loading to false
      setIsLoading(false);
    }
  }, [verifyStoredToken]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user: userData } = response;
      
      setUser(userData);
      
      console.log('✅ User logged in successfully:', userData.email);
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(email, password);
      const { user: userData } = response;
      
      setUser(userData);
      
      console.log('✅ User registered successfully:', userData.email);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authAPI.logout(); // Call backend to clear HttpOnly cookie
      setUser(null);
      console.log('👋 User logged out');
    } catch (error) {
      // Even if logout API fails, clear local state
      console.warn('⚠️ Logout API failed, clearing local state');
      setUser(null);
    }
    // Always redirect to login after logout
    window.location.href = '/login';
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 