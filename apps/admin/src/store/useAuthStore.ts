import { create } from 'zustand';
import type { User } from '../types/auth.ts';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, accessToken: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User | null, accessToken: string | null) => set({
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading: false,
  }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));