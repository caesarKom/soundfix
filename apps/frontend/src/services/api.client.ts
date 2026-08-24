import axios from "axios";
import { ENV } from "@/config/env.config.js";
import { useAuthStore } from "@/store/auth.store.js";

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${ENV.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, user } = response.data;
        useAuthStore.getState().setAuth(accessToken, user);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // clear the state - Guard in the layout/component will detect the lack of a user and redirect via useRouter
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
