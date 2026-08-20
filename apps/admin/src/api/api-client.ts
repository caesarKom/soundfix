import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the access token if present in memory
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handles automatic token refreshing via cookie
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // CRITICAL FIX: If the 401 error comes from the refresh endpoint itself,
    // we MUST NOT try to refresh again. This breaks the infinite loop.
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().setAuth(null, null);
      return Promise.reject(error);
    }

    // Handle token rotation for general 401 errors
    if (error.response?.status === 401 && !('__retry' in originalRequest)) {
      Object.defineProperty(originalRequest, '__retry', { value: true });

      try {
        // Request a new access token from the backend
        const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh');
        
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(currentUser, data.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If the refresh call fails, force logout and wipe the application state
        useAuthStore.getState().setAuth(null, null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);