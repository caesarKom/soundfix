import { apiClient } from '../../../api/api-client.ts';
import { useAuthStore } from '../../../store/useAuthStore.ts';
import type { User, LoginCredentials } from '../../../types/auth.ts';

interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; accessToken: string }> => {
    // Step 1: Login to receive tokens and set cookie
    const { data: tokens } = await apiClient.post<TokensResponse>('/auth/login', credentials);
    
    // Temporarily seed the token into interceptor context before fetching profile
    // This allows the next request to be authenticated
    if (tokens.accessToken) {
      useAuthStore.getState().setAuth(null, tokens.accessToken);
    }

    try {
      // Step 2: Fetch the user profile using the fresh token
      const { data: user } = await apiClient.get<User>('/users/me');
      
      if (user.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      return { user, accessToken: tokens.accessToken };
    } catch (error) {
      // Clear temporary token if profile check fails
      useAuthStore.getState().setAuth(null, null);
      throw error;
    }
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    if (data.role !== 'ADMIN') {
      throw new Error('Access denied. Administrator privileges required.');
    }
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
