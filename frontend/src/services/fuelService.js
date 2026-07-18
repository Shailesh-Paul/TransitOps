import apiClient from '../api/apiClient';

export const getFuelLogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/fuel${query ? `?${query}` : ''}`);
  return response.data;
};

export const getFuelDashboardData = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/fuel/dashboard${query ? `?${query}` : ''}`);
  return response.data;
};

export const getEnterpriseAnalytics = async (scope, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/fuel/enterprise/${scope}${query ? `?${query}` : ''}`);
  return response.data;
};

export const getFuelLogById = async (id) => {
  const response = await apiClient.get(`/fuel/${id}`);
  return response.data.data;
};

export const validateFuelLog = async (fuelData) => {
  const response = await apiClient.post('/fuel/validate', fuelData);
  return response.data.data; // { valid, errors, warnings }
};

export const createFuelLog = async (fuelData) => {
  const response = await apiClient.post('/fuel', fuelData);
  return response.data.data;
};

export const updateFuelLog = async (id, fuelData) => {
  const response = await apiClient.put(`/fuel/${id}`, fuelData);
  return response.data.data;
};

export const deleteFuelLog = async (id) => {
  const response = await apiClient.delete(`/fuel/${id}`);
  return response.data.success;
};
