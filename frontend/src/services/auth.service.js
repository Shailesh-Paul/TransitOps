import apiClient from '../api/apiClient';

/**
 * Auth API Service
 * Handles all authentication related API calls.
 */

export const login = async (email, password) => {
  return await apiClient.post('/auth/login', { email, password });
};

export const logout = async () => {
  return await apiClient.post('/auth/logout');
};

export const getCurrentUser = async () => {
  const payload = await apiClient.get('/auth/me');
  return payload?.user;
};

// Expose refreshSession explicitly if needed by components,
// though apiClient handles token refreshing automatically for 401s.
export const refreshSession = async () => {
  return await apiClient.post('/auth/refresh');
};
