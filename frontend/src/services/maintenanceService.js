import apiClient from '../api/apiClient';

export const getMaintenanceRecords = async (params = {}) => {
  const { page = 1, limit = 100, ...filters } = params;
  return await apiClient.get('/maintenance', { params: { page, limit, ...filters } });
};

export const getQueue = async () => {
  return await apiClient.get('/maintenance/queue');
};

export const getRecordById = async (id) => {
  return await apiClient.get(`/maintenance/${id}`);
};

export const getComprehensiveDetails = async (id) => {
  return await apiClient.get(`/maintenance/${id}/details`);
};

export const getDashboardKpis = async () => {
  return await apiClient.get('/maintenance/dashboard-kpis');
};

export const getAnalytics = async (filters = {}) => {
  return await apiClient.get('/maintenance/analytics', { params: filters });
};

export const createMaintenance = async (payload) => {
  return await apiClient.post('/maintenance', payload);
};

export const queueMaintenance = async (id) => {
  return await apiClient.post(`/maintenance/${id}/queue`);
};

export const startMaintenance = async (id) => {
  return await apiClient.post(`/maintenance/${id}/start`);
};

export const completeMaintenance = async (id, payload) => {
  return await apiClient.post(`/maintenance/${id}/complete`, payload);
};

export const cancelMaintenance = async (id) => {
  return await apiClient.post(`/maintenance/${id}/cancel`);
};

export const updateRecord = async (id, updates) => {
  return await apiClient.put(`/maintenance/${id}`, updates);
};

export const deleteMaintenance = async (id) => {
  return await apiClient.delete(`/maintenance/${id}`);
};

export const updateProgress = async (id, payload) => {
  return await apiClient.put(`/maintenance/${id}/progress`, payload);
};
