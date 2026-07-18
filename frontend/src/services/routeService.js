import apiClient from '../api/apiClient';

export const getRoutes = async (params = {}) => {
  return await apiClient.get('/routes', { params });
};

export const getRoute = async (id) => {
  return await apiClient.get(`/routes/${id}`);
};
