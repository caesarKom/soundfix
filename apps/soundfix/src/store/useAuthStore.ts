import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './storage';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>() (
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            setUser: user => set({ user }),
            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken}),
            logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        }),

        {
            name: 'user-storage',
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),

);

