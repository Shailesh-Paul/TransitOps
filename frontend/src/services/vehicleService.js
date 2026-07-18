import apiClient from '../api/apiClient';

/**
 * Fetch paginated vehicles with optional search and filters
 * @param {Object} params - e.g., { page: 1, limit: 10, search: '...', status: 'Available' }
 */
export const getVehicles = async (params = {}) => {
  return await apiClient.get('/vehicles', { params });
};

export const getVehicle = async (id) => {
  return await apiClient.get(`/vehicles/${id}`);
};

export const createVehicle = async (vehicleData) => {
  return await apiClient.post('/vehicles', vehicleData);
};

export const updateVehicle = async (id, updates) => {
  return await apiClient.put(`/vehicles/${id}`, updates);
};

/**
 * Soft delete (archive) a vehicle
 */
export const deleteVehicle = async (id) => {
  return await apiClient.put(`/vehicles/${id}/archive`);
};

/**
 * Restore an archived vehicle
 */
export const restoreVehicle = async (id) => {
  return await apiClient.put(`/vehicles/${id}/restore`);
};
