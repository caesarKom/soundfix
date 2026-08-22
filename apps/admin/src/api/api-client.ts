import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!(error instanceof AxiosError)) return Promise.reject(error);

    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Silent refresh logic if token expires during session usage
    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/refresh') && !('__retry' in originalRequest)) {
      Object.defineProperty(originalRequest, '__retry', { value: true });
      try {
        const { data } = await axios.post<{ accessToken: string }>(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(currentUser, data.accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        useAuthStore.getState().setAuth(null, null);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
