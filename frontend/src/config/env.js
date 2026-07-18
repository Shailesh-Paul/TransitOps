/**
 * Centralized Environment Configuration
 * Safely accesses Vite's import.meta.env variables with fallbacks.
 */

const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TransitOps Enterprise',
};

export default env;
