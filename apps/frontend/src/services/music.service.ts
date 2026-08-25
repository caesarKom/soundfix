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
}

export interface SearchResponse {
  songs: MusicTrack[]
  playlists: any[]
}

export const musicService = {
  async getPublicTracks(): Promise<MusicTrack[]> {
    const response = await api.get<MusicTrack[]>("/music")
    return response.data
  },

  async getUserPlaylists(): Promise<PlaylistData[]> {
    const response = await api.get<PlaylistData[]>("/playlists")
    return response.data
  },

  async getPlaylistById(id: string): Promise<PlaylistData> {
    const response = await api.get<PlaylistData>(`/playlists/${id}`)
    return response.data
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

  async createPlaylist(data: {
    name: string
    description?: string
    isPrivate?: boolean
  }): Promise<PlaylistData> {
    const response = await api.post<PlaylistData>("/playlists", data)
    return response.data
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
}
