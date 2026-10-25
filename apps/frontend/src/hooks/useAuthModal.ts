import { create } from "zustand"

interface AuthModalStore {
  isOpen: boolean
  onOpen: () => void
  onOpenLogin: () => void
  onOpenRegister: () => void
  onClose: () => void
  type: "login" | "register" | null
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onOpenLogin: () => set({ isOpen: true, type: "login" }),
  onOpenRegister: () => set({ isOpen: true, type: "register" }),
  onClose: () => set({ isOpen: false, type: null }),
  type: "login",
}))