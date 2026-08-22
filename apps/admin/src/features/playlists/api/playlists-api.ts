import { apiClient } from '../../../api/api-client.ts';
import type { AdminPlaylist } from '../types/playlists.ts';

export const playlistsApi = {
  // Fetch all playlists in the system
  getAll: async (): Promise<AdminPlaylist[]> => {
    const { data } = await apiClient.get<AdminPlaylist[]>('/playlists');
    return data;
  },

  // Fetch specific playlist detail along with its songs
  getById: async (id: string): Promise<AdminPlaylist> => {
    const { data } = await apiClient.get<AdminPlaylist>(`/playlists/${id}`);
    return data;
  },

  // Create a new global playlist
 create: async (formData: FormData): Promise<AdminPlaylist> => {
  const { data } = await apiClient.post<AdminPlaylist>('/playlists', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
},

  // Link a track to a playlist
  addTrack: async (playlistId: string, trackId: string): Promise<void> => {
    await apiClient.post(`/playlists/${playlistId}/songs`, { songId: trackId });
  },

  // Unlink a track from a playlist
  removeTrack: async (playlistId: string, trackId: string): Promise<void> => {
    // Usually NestJS takes trackId in body or query depending on implementation
    await apiClient.delete(`/playlists/${playlistId}/songs`, { data: { songId: trackId } });
  },

  // Permanently delete a playlist
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/playlists/${id}`);
  },
};
