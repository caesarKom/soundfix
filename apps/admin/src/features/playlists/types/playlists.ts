import type { Track } from '../../music/types/music.ts';

export interface AdminPlaylist {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPrivate: boolean;
  userId: string;
  songs?: Track[];
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPrivate: boolean;
}
