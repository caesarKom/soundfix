 export interface ApiTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string; 
  duration: number; 
  mimeType?: string;
  mediaUrl: string;
}

export interface RNTrack {
  id: string;
  title: string;
  artist: string;
  albumTitle?: string;
  duration: number;
  url: string;
  artworkUrl?: string;
  mimeType?: string; // 'audio/mpeg' | 'video/mp4'
}

export const mapToPlayerTrack = (apiTrack: ApiTrack): RNTrack => {
 return {
    id: apiTrack.id,
    title: apiTrack.title,
    artist: apiTrack.artist,
    albumTitle: apiTrack.album,
    artworkUrl: apiTrack.coverUrl,
    duration: apiTrack.duration,
    mimeType: apiTrack.mimeType, 
    url: apiTrack.mediaUrl,
    mediaId: apiTrack.id, 
 }

}