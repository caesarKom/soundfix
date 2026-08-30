export interface UpdateUserProfile {
  name?: string;
  profile?: {
  firstName?: string | null;
  lastName?: string | null;
  birthDay?: string | null;
  bio?: string | null;
  avatar?: string | null;
  gender?: string | null;
  }
}

export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    birthDay?: string | null;
    bio?: string | null;
    avatar?: string | null;
    gender?: string | null;
  }
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  code: string;
}