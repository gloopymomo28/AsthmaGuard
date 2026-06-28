import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyMagicLink: (token: string, email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('ag_token');
      const email = await SecureStore.getItemAsync('ag_email');
      if (token) {
        setIsAuthenticated(true);
        setUserEmail(email);
      }
    } catch (err) {
      console.warn('Error reading secure store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      await authService.sendMagicLink(email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Failed to send magic link.',
      };
    }
  };

  const verifyMagicLink = async (token: string, email: string) => {
    try {
      const data = await authService.verifyToken(token, email);
      await SecureStore.setItemAsync('ag_token', data.access_token);
      await SecureStore.setItemAsync('ag_email', email);
      setIsAuthenticated(true);
      setUserEmail(email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Invalid or expired token.',
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('ag_token');
    await SecureStore.deleteItemAsync('ag_email');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, userEmail, sendMagicLink, verifyMagicLink, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
