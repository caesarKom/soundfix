import { create } from "zustand";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentTrackIndex: number;
  setTrack: (track: Track, queue?: Track[], index?: number) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  queue: [],
  currentTrackIndex: 0,
  setTrack: (track, queue = [], index = 0) => set({
    currentTrack: track,
    queue: queue.length ? queue : [track],
    currentTrackIndex: index,
    isPlaying: true
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  nextTrack: () => {
    const { queue, currentTrackIndex } = get();
    if (currentTrackIndex < queue.length - 1) {
      const nextIndex = currentTrackIndex + 1;
      set({ currentTrack: queue[nextIndex], currentTrackIndex: nextIndex, isPlaying: true });
    }
  },
  prevTrack: () => {
    const { queue, currentTrackIndex } = get();
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      set({ currentTrack: queue[prevIndex], currentTrackIndex: prevIndex, isPlaying: true });
    }
  }
}));
