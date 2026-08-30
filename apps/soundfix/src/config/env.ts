export const API_BASE_URL = 'http://192.168.0.7:5001/v1'  // 'https://apis.iscode.eu/v1';
export const MEDIA_URL = 'http://192.168.0.7:5001'

export const LOGIN = `${API_BASE_URL}/auth/login`;
export const REGISTER = `${API_BASE_URL}/auth/register`;

export const RESEND_OTP = `${API_BASE_URL}/auth/resend-otp`
export const VERIFY_OTP = `${API_BASE_URL}/auth/verify-otp`

export const REFRESH_TOKEN = `${API_BASE_URL}/auth/refresh`;