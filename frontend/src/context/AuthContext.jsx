import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // We use the same Vite env var for API
  const apiUrl = import.meta.env.VITE_API_URL || 'https://asthmaguard.onrender.com/api';

  useEffect(() => {
    // Auth bypassed for now
  }, []);

  const sendMagicLink = async (email) => {
    try {
      await axios.post(`${apiUrl}/auth/send-magic-link`, { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to send magic link.' 
      };
    }
  };

  const verifyMagicLink = async (token, email) => {
    try {
      const response = await axios.post(`${apiUrl}/auth/verify`, { token, email });
      const { access_token } = response.data;
      
      localStorage.setItem('ag_token', access_token);
      localStorage.setItem('ag_email', email);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Invalid or expired token.' 
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ag_token');
    localStorage.removeItem('ag_email');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, sendMagicLink, verifyMagicLink, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
