import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface UserPayload {
  id: string
  email: string
  name: string
  role: "ADMIN" | "MEMBER"
}

interface AuthState {
  accessToken: string | null
  user: UserPayload | null
  setToken: (accessToken: string) => void
  setUser: (user: UserPayload) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "soundfix-auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
