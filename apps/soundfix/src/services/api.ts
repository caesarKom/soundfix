import axios from "axios";
import { API_BASE_URL, REFRESH_TOKEN } from "../config/env";
import { token_storage } from "../store/storage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(async config => {
    const token = token_storage.getString('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    response => response,

    async error => {
        if (error.response && error.response.status === 401) {
      try {
        const newToken = await refreshToken();
        if (newToken) {
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        console.log('Error Refreshing token');
      }
    }
    if (error.response && error.response.status !== 401) {
      const errorMessage = error.response || 'Something went wrong';
      console.log('ERROR Message : ', errorMessage);
    }

    return Promise.reject(error);
    }
)

export const refreshToken = async () => {
  try {
    const refresh_token = token_storage.getString('refresh_token');
    const response = await axios.post(REFRESH_TOKEN, { refresh_token });

    if (response.status !== 200) {
      return null;
    }

    const newAccess = await response.data.accessToken
    const newRefresh = await response.data.refreshToken

    if (response.data.success) {
      token_storage.set('access_token', newAccess);
      token_storage.set('refresh_token', newRefresh);

      return newAccess
    }
  } catch (error) {
    console.log('REFRESH TOKEN EXPIRED!!!', error);
    
    token_storage.clearAll();
  }

};