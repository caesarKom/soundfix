import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './storage';
import TrackPlayer from '@rntp/player';
import { api } from '../services/api';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  url: string;
  coverUrl?: string;
  mimeType?: string;
}

interface MediaItem {
  mediaId: string;
  url: string;
  title?: string;
  artist?: string;
  albumTitle?: string;
  artworkUrl?: string;
  duration?: number;
  mimeType?: string;
}

const convertTrackToCleanMedia = (track: Track): MediaItem => ({
  mediaId: track.id,
  title: track.title,
  artist: track.artist,
  albumTitle: track.album,
  duration: track.duration,
  url: track.url || "",
  artworkUrl: track.coverUrl,
  mimeType: track.mimeType,
});

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  position: number;
  duration: number;
  queue: Track[];

  getSecuredUrl: (trackId: string) => Promise<string>;

  // Actions
  loadQueueWithoutPlaying: (tracks: Track[], targetTrackId?: string) => void;
  playTrackFromLoadedQueue: (trackId: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  
  setPlaying: (isPlaying: boolean) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  updatePosition: (position: number, duration: number) => void;
  syncCurrentTrackWithNative: () => void;
  resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      isExpanded: false,
      position: 0,
      duration: 0,
      queue: [],

      setPlaying: (isPlaying) => set({ isPlaying }),
      setIsExpanded: (isExpanded) => set({ isExpanded }),
      updatePosition: (position, duration) => set({ position, duration }),


      getSecuredUrl: async (trackId: string): Promise<string> => {
        try {
          const response = await api.get(`/auth/media-token`, { params: { mediaId: trackId } });
          const mediaToken = response.data.token;
          const baseUrl = api.defaults.baseURL || '';
          return `${baseUrl}/music/stream/${trackId}?token=${mediaToken}`;
        } catch (error) {
          console.error(`Nie udało się pobrać bezpiecznego tokenu dla utworu ${trackId}:`, error);
          throw error;
        }
      },

      // Load quake without play
      loadQueueWithoutPlaying: (tracks: Track[], targetTrackId?: string) => {
        if (!tracks || tracks.length === 0) return;

        const startIndex = targetTrackId ? tracks.findIndex(t => t.id === targetTrackId) : 0;
        const safeIndex = startIndex === -1 ? 0 : startIndex;

        set({
          queue: tracks,
          currentTrack: tracks[safeIndex],
          isPlaying: false,
          position: 0,
        });

        const cleanMediaItems = tracks.map(convertTrackToCleanMedia);
        
        TrackPlayer.setMediaItems(cleanMediaItems, safeIndex);
      },

      // CLICK ON A SONG FROM THE LIST -> DOWNLOAD ON THE FLY AND START
      playTrackFromLoadedQueue: async (trackId: string) => {
        const { queue, getSecuredUrl } = get();
        const targetIndex = queue.findIndex(t => t.id === trackId);
        if (targetIndex === -1) return;

        try {
          const targetTrack = queue[targetIndex];
          
          const signedUrl = await getSecuredUrl(targetTrack.id);

          const mediaItem = convertTrackToCleanMedia(targetTrack);
          mediaItem.url = signedUrl;

          set({ currentTrack: targetTrack, isPlaying: true });

          // Replacing the URL in native memory just before launch
          TrackPlayer.replaceMediaItem(targetIndex, mediaItem);
          TrackPlayer.setMediaItems(TrackPlayer.getQueue(), targetIndex);
          
          await TrackPlayer.play();
        } catch (error) {
          console.error('Błąd startu utworu z kolejki:', error);
        }
      },

      play: async () => {
        const { currentTrack, getSecuredUrl } = get();
        if (!currentTrack) return;

        try {
          const activeIndex = TrackPlayer.getActiveMediaItemIndex();
          if (activeIndex !== null) {
            // refresh the token in case an hour has passed since clicking Pause
            const signedUrl = await getSecuredUrl(currentTrack.id);
            const updatedItem = convertTrackToCleanMedia(currentTrack);
            updatedItem.url = signedUrl;
            
            TrackPlayer.replaceMediaItem(activeIndex, updatedItem);
          }
          await TrackPlayer.play();
          set({ isPlaying: true });
        } catch (error) {
          console.error(error);
        }
      },

      pause: async () => {
        await TrackPlayer.pause();
        set({ isPlaying: false });
      },

      // (NEXT TRACK)
      skipToNext: async () => {
        const { queue, getSecuredUrl } = get();
        const currentIndex = TrackPlayer.getActiveMediaItemIndex();

        if (currentIndex !== null && currentIndex < queue.length - 1) {
          const nextIndex = currentIndex + 1;
          const nextTrack = queue[nextIndex];

          try {
            const signedUrl = await getSecuredUrl(nextTrack.id);
            const mediaItem = convertTrackToCleanMedia(nextTrack);
            mediaItem.url = signedUrl;

            set({ currentTrack: nextTrack, position: 0 });

            TrackPlayer.replaceMediaItem(nextIndex, mediaItem);
            TrackPlayer.setMediaItems(TrackPlayer.getQueue(), nextIndex);
            
            await TrackPlayer.play();
            set({ isPlaying: true });
          } catch (error) {
            console.error('Błąd przejścia do następnego utworu:', error);
          }
        }
      },

      // (PREVIOUS TRACK)
      skipToPrevious: async () => {
        const { queue, getSecuredUrl } = get();
        const currentIndex = TrackPlayer.getActiveMediaItemIndex();

        if (currentIndex !== null && currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          const prevTrack = queue[prevIndex];

          try {
            const signedUrl = await getSecuredUrl(prevTrack.id);
            const mediaItem = convertTrackToCleanMedia(prevTrack);
            mediaItem.url = signedUrl;

            set({ currentTrack: prevTrack, position: 0 });

            TrackPlayer.replaceMediaItem(prevIndex, mediaItem);
            TrackPlayer.setMediaItems(TrackPlayer.getQueue(), prevIndex);
            
            await TrackPlayer.play();
            set({ isPlaying: true });
          } catch (error) {
            console.error(error);
          }
        }
      },

      syncCurrentTrackWithNative: () => {
        const activeIndex = TrackPlayer.getActiveMediaItemIndex();
        const { queue } = get();
        if (activeIndex !== null && queue[activeIndex]) {
          set({ currentTrack: queue[activeIndex], position: 0 });
        }
      },

      resetPlayer: () => {
        TrackPlayer.clear();
        set({
          currentTrack: null,
          isPlaying: false,
          isExpanded: false,
          position: 0,
          duration: 0,
          queue: [],
        });
      },
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
