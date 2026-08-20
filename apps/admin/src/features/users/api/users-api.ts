import { apiClient } from '../../../api/api-client.ts';
import type { AdminUser, UpdateUserDto } from '../types/users.ts';

export const usersApi = {
  // Fetch all registered users
  getAll: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get<AdminUser[]>('/users');
    return data;
  },

  // Update specific user details or roles
  update: async ({ id, dto }: { id: string; dto: UpdateUserDto }): Promise<AdminUser> => {
    const { data } = await apiClient.patch<AdminUser>(`/users/${id}`, dto);
    return data;
  },

  // Completely delete a user account from the ecosystem
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
