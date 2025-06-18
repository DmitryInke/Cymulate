import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AuthContextType, User } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          // Verify token with backend
          const response = await authAPI.verifyToken();
          
          // Token is valid, set user and token
          setToken(savedToken);
          setUser(response.user);
          console.log('✅ Token verified successfully');
        } catch (error) {
          // Token is invalid, clear storage
          console.warn('⚠️ Stored token is invalid, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No stored token found');
      }
    } catch (error) {
      console.error('❌ Error during token verification:', error);
    } finally {
      setIsLoading(false);
      isVerifyingToken.current = false;
    }
  }, []);

  useEffect(() => {
    // Check for existing token on app start and verify it - only once
    verifyStoredToken();
  }, [verifyStoredToken]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { accessToken, user: userData } = response;
      
      setToken(accessToken);
      setUser(userData);
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
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
      const { accessToken, user: userData } = response;
      
      setToken(accessToken);
      setUser(userData);
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ User registered successfully:', userData.email);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback((): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('👋 User logged out');
  }, []);

  const value: AuthContextType = {
    user,
    token,
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