import { api } from "./api.client";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  audioUrl: string;
  coverUrl: string;
  playCount: number;
  isPublic: boolean;
  userId: string;
  mimeType: string;
}

export interface PlaylistData {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  isPrivate: boolean;
  userId: string;
  songs?: MusicTrack[];
}

export interface SearchResponse {
  songs: MusicTrack[];
  playlists: any[]; // You can replace it with PlaylistData[] if you want to map playlists as well
}

export const musicService = {
  async getPublicTracks(): Promise<MusicTrack[]> {
    const response = await api.get<MusicTrack[]>("/music");
    return response.data;
  },

  async getUserPlaylists(): Promise<PlaylistData[]> {
    const response = await api.get<PlaylistData[]>("/playlists");
    return response.data;
  },

  async getPlaylistById(id: string): Promise<PlaylistData> {
  const response = await api.get<PlaylistData>(`/playlists/${id}`);
  return response.data;
},

async searchTracks(query: string): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>(`/music/search?q=${encodeURIComponent(query)}`);
  return response.data;
}

};
