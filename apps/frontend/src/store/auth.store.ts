import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
}

interface AuthState {
  accessToken: string | null;
  //accessTokenExpiresAt: number | null;
  user: UserPayload | null;
  setAuth: (accessToken: string, expiresInSeconds: number, user: UserPayload) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, _, user) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    { name: "soundfix-auth-storage", storage: createJSONStorage(() => sessionStorage) }
  )
);
