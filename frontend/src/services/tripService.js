import apiClient from '../api/apiClient';

export const getTrips = async (params = {}) => {
  return await apiClient.get('/trips', { params });
};

export const getTrip = async (id) => {
  return await apiClient.get(`/trips/${id}`);
};

export const createTrip = async (tripData) => {
  return await apiClient.post('/trips', tripData);
};

export const updateTrip = async (id, updates) => {
  return await apiClient.put(`/trips/${id}`, updates);
};

export const deleteTrip = async (id) => {
  // Assuming backend doesn't officially support soft delete for trips yet,
  // but if it did it would be a DELETE request or a patch.
  // For now, cancel might be the equivalent logical action.
  return await apiClient.post(`/trips/${id}/cancel`);
};

export const dispatchTrip = async (id) => {
  return await apiClient.post(`/trips/${id}/dispatch`);
};

export const startTrip = async (id) => {
  return await apiClient.post(`/trips/${id}/start`);
};

export const completeTrip = async (id, data) => {
  return await apiClient.post(`/trips/${id}/complete`, data);
};

export const cancelTrip = async (id, data) => {
  return await apiClient.post(`/trips/${id}/cancel`, data);
};

export const terminateTrip = async (id, data) => {
  return await apiClient.post(`/trips/${id}/terminate`, data);
};
