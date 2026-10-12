interface UserProfile {
  firstName: string
  lastName: string
  avatar: string
  gender: "MALE" | "FEMALE" | "OTHER"
}

export interface UserPayload {
  id: string
  email: string
  name: string
  role: "ADMIN" | "MEMBER"
  profile: UserProfile
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}

export interface MediaTokenDto {
  token: string;
}