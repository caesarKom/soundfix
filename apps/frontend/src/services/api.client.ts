import axios from "axios";
import { ENV } from "@/config/env.config";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej }))
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
      }
      isRefreshing = true;
      try {
        const { data } = await refreshClient.post("/auth/refresh");
        useAuthStore.getState().setAuth(data.accessToken, 0, data.user);
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        useAuthStore.getState().clearAuth();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
