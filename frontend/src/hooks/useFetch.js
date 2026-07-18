import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall, successMessage) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await apiCall();
      if (successMessage) toast.success(successMessage);
      return response;
    } catch (err) {
      const msg = err.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request };
};
