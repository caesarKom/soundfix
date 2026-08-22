import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type User } from '../types/auth.ts';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, accessToken: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => set({
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
      }),
    }),
    {
      name: 'soundfix-admin-session', // Unique storage session key
      storage: createJSONStorage(() => sessionStorage), // Keeps session alive until tab closes
    }
  )
);
