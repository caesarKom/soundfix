import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { useEffect, useState } from "react"

export function useAuth() {
  const token = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [mounted, setIsMounted] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
        if (!token) {
            setIsMounted(false)
            return
        }
        if (token && user) {
            setIsMounted(false)
            return
        }
        try {
            const user = await authService.getUserProfile()
            setUser(user)
        } catch (e) {
            console.error("Error fetch user: ", e)
            clearAuth()
        } finally {
            setIsMounted(false)
        }
    }
    fetchUser()
  }, [clearAuth, setUser, token, user])

  return {
    user,
    token,
    mounted,
    isAuthenticated: !!user && !!token,
  }
}