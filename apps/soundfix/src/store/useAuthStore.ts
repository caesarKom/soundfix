import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  checkAuthStatus: async () => {
    try {
      // Simulate token restoration check from persistence (e.g. MMKV or SecureStore)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Default to unauthenticated state after splash check
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to restore authentication state:', error);
      set({ isLoading: false });
    }
  },
}));