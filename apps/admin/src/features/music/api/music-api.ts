import { apiClient } from '../../../api/api-client.ts';
import type { Track, CreateTrackDto } from '../types/music.ts';

export const musicApi = {
  // Fetch all music tracks
  getAll: async (): Promise<Track[]> => {
    const { data } = await apiClient.get<Track[]>('/music');
    return data;
  },

  // Upload a new track using Multipart/Form-Data
  create: async (dto: CreateTrackDto): Promise<Track> => {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('artist', dto.artist);
    if (dto.album) formData.append('album', dto.album);
    formData.append('isPublic', String(dto.isPublic));
    formData.append('audio', dto.audio);
    formData.append('duration', String(dto.duration));
    if (dto.cover) formData.append('cover', dto.cover);

    const { data } = await apiClient.post<Track>('/music', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  update: async ({ id, dto }: { id: string; dto: Partial<CreateTrackDto> }): Promise<Track> => {
  const formData = new FormData();
  if (dto.title) formData.append('title', dto.title);
  if (dto.artist) formData.append('artist', dto.artist);
  if (dto.album) formData.append('album', dto.album);
  if (dto.isPublic !== undefined) formData.append('isPublic', String(dto.isPublic));
  if (dto.duration) formData.append('duration', String(dto.duration));
  if (dto.cover) formData.append('cover', dto.cover); // New cover binary file

  const { data } = await apiClient.patch<Track>(`/music/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
},

  // Remove a track from the library
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/music/${id}`);
  },
};
