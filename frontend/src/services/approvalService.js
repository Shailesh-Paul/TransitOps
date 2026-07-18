import apiClient from '../api/apiClient';

export const submitExpense = async (id, comments = '') => {
  const response = await apiClient.post(`/expenses/${id}/submit`, { comments });
  return response.data;
};

export const approveExpense = async (id, comments = '') => {
  const response = await apiClient.post(`/expenses/${id}/approve`, { comments });
  return response.data;
};

export const rejectExpense = async (id, reason, comments = '') => {
  const response = await apiClient.post(`/expenses/${id}/reject`, { reason, comments });
  return response.data;
};

export const postExpense = async (id, comments = '') => {
  const response = await apiClient.post(`/expenses/${id}/post`, { comments });
  return response.data;
};

export const archiveExpense = async (id, comments = '') => {
  const response = await apiClient.post(`/expenses/${id}/archive`, { comments });
  return response.data;
};
