export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
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
