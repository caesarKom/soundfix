import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { useEffect, useState } from "react"

export function useAuth() {
  const token = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
        if (!token) {
            setIsLoading(false)
            return
        }
        if (token && user) {
            setIsLoading(false)
            return
        }
        try {
            const user = await authService.getUserProfile()
            setUser(user)
        } catch (e) {
            console.error("Error fetch user: ", e)
            clearAuth()
        } finally {
            setIsLoading(false)
        }
    }
    fetchUser()
  }, [clearAuth, setUser, token, user])

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
  }
}