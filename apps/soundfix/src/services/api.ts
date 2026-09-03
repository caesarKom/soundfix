import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
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
        const { refreshToken } = useAuthStore.getState();
        const { data } = await refreshClient.post("/auth/refresh", { refreshToken });

        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        
 
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        useAuthStore.getState().logout()
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
