import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { LoginDto, LoginResponse, RegisterDto, VerifyOtpDto } from '../types/auth';

export const useMe = () => {
    const setUser = useAuthStore((state) => state.setUser);

    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await api.get('/users/me')
            setUser(data);
            return data;
        },
        //enabled: !!accessToken, // Only fetch if user is authenticated
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
};

export const useLoginMutation = () => {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
    },
    onError: (error) => {
      console.error('Login', error);
    }
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (dto: RegisterDto) => {
      const { data } = await api.post<{ message: string; email: string }>('/users/register', dto);
      return data;
    },
  });
};


export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: async (dto: VerifyOtpDto) => {
      const { data } = await api.post<{ message: string; status: string }>('/users/verify-otp', dto);
      return data;
    },
  });
};

export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout');
      } catch {
        // Ignore any errors during logout
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
};