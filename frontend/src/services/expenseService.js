import { mockExpenses } from '../data/mockData';
import { generateId } from '../utils/helpers';
import apiClient from '../api/apiClient';

let data = [...mockExpenses];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getExpenses = async () => {
  await delay(500);
  return data;
};

export const getExpenseById = async (id) => {
  const response = await apiClient.get(`/expenses/${id}`);
  return response.data;
};

export const getDashboardKpis = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/expenses/dashboard-kpis?${query}`);
  return response.data;
};

export const addExpense = async (expense) => {
  await delay(500);
  const newValue = { ...expense, id: `EXP-${generateId()}` };
  data = [newValue, ...data];
  return newValue;
};

export const deleteExpense = async (id) => {
  await delay(500);
  data = data.filter(e => e.id !== id);
  return true;
};
