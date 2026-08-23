export type UserRole = "ADMIN" | "MEMBER"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isVerified: boolean
  profile?: Profile
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
}

export interface LoginCredentials {
  email: string
  password: string
}
export type Gender = "MALE" | "FEMALE" | "OTHER"

type Profile = {
  firstName?: string
  lastName?: string
  birthDay?: string
  avatar?: string
  bio?: string
  gender?: Gender
}
