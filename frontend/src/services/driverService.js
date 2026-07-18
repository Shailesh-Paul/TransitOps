import apiClient from '../api/apiClient';

export const getDrivers = async (params = {}) => {
  return await apiClient.get('/drivers', { params });
};

export const getDriver = async (id) => {
  return await apiClient.get(`/drivers/${id}`);
};

export const createDriver = async (driver) => {
  return await apiClient.post('/drivers', driver);
};

export const updateDriver = async (id, updates) => {
  return await apiClient.put(`/drivers/${id}`, updates);
};

export const deleteDriver = async (id) => {
  return await apiClient.put(`/drivers/${id}/archive`);
};

export const restoreDriver = async (id) => {
  return await apiClient.put(`/drivers/${id}/restore`);
};
