import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { tokenStorage } from '../utils/tokenStorage';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getToken();
      if (token) {
        try {
          // Verify token and load current user from API
          const profile = await authService.getCurrentUser();
          setUser(profile);
          setIsAuthenticated(true);
        } catch (error) {
          // Invalid or expired token (apiClient will try to refresh first)
          console.warn('Session restoration failed:', error);
          tokenStorage.clearToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const { accessToken } = await authService.login(email, password);
      
      // Store token immediately so subsequent API calls succeed
      tokenStorage.setToken(accessToken);
      
      // Fetch full profile with enterprise permissions
      const fullProfile = await authService.getCurrentUser();
      
      // Update state
      setUser(fullProfile);
      setIsAuthenticated(true);
      
      toast.success('Authentication successful');
    } catch (error) {
      console.error('Login error', error);
      
      let message = 'An unexpected error occurred';
      if (error.message === 'Network Error') {
        message = 'Network Error: Cannot reach backend server. Check if the server is running or restarting.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 401 || error.response?.status === 400) {
        message = 'Invalid credentials';
      }
      
      toast.error(message);
      throw error; // Rethrow so the component can stop the loading spinner
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      tokenStorage.clearToken();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login'; // Force redirect and clear all React state safely
    }
  };

  /**
   * Enterprise RBAC Helper
   * Checks if the currently authenticated user has the requested permission.
   * Passing '*' always returns true if authenticated.
   */
  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    if (!permission || permission === '*') return true;
    
    // Super Admins usually have all permissions seeded in the database,
    // but just in case, we could also check user.role_id === 1
    if (user.role_id === 1) return true;
    
    return user.permissions?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
