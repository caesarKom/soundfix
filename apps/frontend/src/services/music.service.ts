import { api } from "./api.client"

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  audioUrl: string
  coverUrl: string
  playCount: number
  isPublic: boolean
  userId: string
  mimeType: string
}

export interface PlaylistData {
  id: string
  name: string
  description: string
  coverUrl: string
  isPrivate: boolean
  userId: string
  songs?: MusicTrack[]
  owner?: {
    id: string;
    name: string;
  }
  _count?: {
    songs: number;
  };
}

export interface SearchResponse {
  songs: MusicTrack[]
  playlists: any[]
}

export const musicService = {
  async getPublicTracks(params: { page?: number; limit?: number; search?: string }): Promise<MusicTrack[]> {
    const { data } = await api.get<MusicTrack[]>("/music", {
      params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      search: params.search,
    },
    });
    return data;
  },

  async getUserPlaylists(): Promise<PlaylistData[]> {
    const response = await api.get<PlaylistData[]>("/playlists")
    return response.data
  },

  async getPlaylistById(id: string): Promise<PlaylistData> {
    const response = await api.get<PlaylistData>(`/playlists/${id}`)
    return response.data
  },

  async getPlaylistSongs(playlistId: string, params?: { page?: number; limit?: number }) {
  const { data } = await api.get(`/playlist/${playlistId}/songs`, {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
    },
  });
  return data;
},

  async searchTracks(query: string): Promise<SearchResponse> {
    const response = await api.get<SearchResponse>(
      `/music/search?q=${encodeURIComponent(query)}`,
    )
    return response.data
  },

  async getLikedTracks(): Promise<MusicTrack[]> {
    const response = await api.get<MusicTrack[]>("/music/liked")
    return response.data
  },

  async toggleLikeTrack(id: string): Promise<{ liked: boolean }> {
    const response = await api.post<{ liked: boolean }>(`/music/like/${id}`)
    return response.data
  },

  async createPlaylist(formData: FormData) {
  const { data } = await api.post('/playlist', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
},

  async addSongToPlaylist(playlistId: string, musicId: string): Promise<void> {
    await api.post(`/playlists/${playlistId}/songs`, { songId: musicId })
  },

  async removeSongFromPlaylist(
    playlistId: string,
    musicId: string,
  ): Promise<void> {
    await api.delete(`/playlists/${playlistId}/songs`, { data: { songId: musicId } })
  },

  async updatePlaylist(id: string, formData: FormData) {
  const { data } = await api.put(`/playlist/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
},

async deletePlaylist(id: string) {
  const { data } = await api.delete(`/playlist/${id}`);
  return data;
},

}
