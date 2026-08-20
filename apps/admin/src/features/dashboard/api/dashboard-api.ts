import { apiClient } from '../../../api/api-client.ts';
import type { SystemStats } from '../types/dashboard.ts';

export const dashboardApi = {
  getStats: async (): Promise<SystemStats> => {
    const { data } = await apiClient.get<SystemStats>('/admin/stats');
    return data;
  },
};