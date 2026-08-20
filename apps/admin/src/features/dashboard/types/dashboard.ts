export interface SystemStats {
  totalUsers: number;
  totalTracks: number;
  totalPlaylists: number;
  totalPlayCount: number;
  recentTracks: {
    id: string;
    title: string;
    artist: string;
    playCount: number;
  }[];
}