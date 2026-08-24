import { api } from "./api.client";
import { LoginDto, RegisterDto, VerifyOtpDto, AuthResponse, MediaTokenDto } from "@/types/auth.types";

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterDto): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/register", data);
    return response.data;
  },

  async verifyOtp(data: VerifyOtpDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/verify-otp", data);
    return response.data;
  },

  async getMediaToken(): Promise<MediaTokenDto> {
  const response = await api.get("/auth/media-token");
  const mediaToken =  response.data.token
  return mediaToken;
},

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
