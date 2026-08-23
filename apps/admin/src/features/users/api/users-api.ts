import { apiClient } from '../../../api/api-client.ts';
import type { AdminUser, CreateUser } from '../types/users.ts';

export const usersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<AdminUser[]>('/users');
    return data;
  },

  create: async (dto: CreateUser): Promise<AdminUser> => {
    const { data } = await apiClient.post<AdminUser>('/users/register', dto);
    return data;
  },

  update: async ({ id, formData }: { id: string; formData: FormData }): Promise<AdminUser> => {
  const { data } = await apiClient.patch<AdminUser>(`/users/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
},

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
