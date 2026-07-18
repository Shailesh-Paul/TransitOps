import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return '';
  return format(new Date(dateString), formatStr);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.length > 1 
    ? `${parts[0][0]}${parts[1][0]}` 
    : parts[0][0];
};
