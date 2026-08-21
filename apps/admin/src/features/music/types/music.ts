export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  audioUrl: string;
  coverUrl: string | null;
  playCount: number;
  isPublic: boolean;
  mimeType: string;
  userId: string;
}

export interface CreateTrackDto {
  title: string;
  artist: string;
  album?: string;
  isPublic: boolean;
  audio: File;
  cover?: File;
  duration: number;
}
