import axios from 'axios';
import env from '../config/env';
import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = env.API_URL || 'http://localhost:5000/api/v1';

/**
 * Enterprise Axios API Client Configuration
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending the HttpOnly refresh cookie
});

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Automatic Token Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Axios puts the body in `response.data`
    const payload = response.data;
    
    // Automatically unwrap the backend's ApiResponse envelope if present
    if (payload && payload.success !== undefined && payload.data !== undefined) {
      if (payload.meta !== undefined) {
        return { data: payload.data, meta: payload.meta };
      }
      return payload.data;
    }
    
    // Fallback for responses that don't use the standard envelope
    return payload;
  },
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops on auth endpoints
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use raw axios to bypass the interceptors
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        
        if (newAccessToken) {
          tokenStorage.setToken(newAccessToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token returned from refresh');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clearToken();
        // Redirect to login (assuming window exists)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

