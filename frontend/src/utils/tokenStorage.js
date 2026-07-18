const TOKEN_KEY = 'transitops_access_token';

/**
 * Enterprise Token Storage Utility
 * Abstracted to easily switch between localStorage, sessionStorage, or in-memory stores.
 */
export const tokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error reading token from storage', e);
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Error saving token to storage', e);
    }
  },

  clearToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Error removing token from storage', e);
    }
  },
};
