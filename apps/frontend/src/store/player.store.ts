import { create } from "zustand";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  mimeType: string;
}

interface PlayerState {
  queue: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  currentTrack: () => Track | null;
  setTrack: (track: Track, queue?: Track[], index?: number) => void;
  togglePlay: () => void;
  playTrack: () => void;
  pauseTrack: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;

  isRightPanelVisible: boolean;
  toggleRightPanel: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.5,
  progress: 0,
  duration: 0,
  currentTrack: () => {
    const { queue, currentTrackIndex } = get();
    return queue[currentTrackIndex] || null;
  },
  setTrack: (track, queue = [], index = 0) => set({
    queue: queue.length ? queue : [track],
    currentTrackIndex: index,
    isPlaying: true,
    progress: 0
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  playTrack: () => set({ isPlaying: true }),
  pauseTrack: () => set({ isPlaying: false }),
  next: () => {
    const { queue, currentTrackIndex } = get();
    if (currentTrackIndex < queue.length - 1) {
      set({ currentTrackIndex: currentTrackIndex + 1, isPlaying: true, progress: 0 });
    }
  },
  prev: () => {
    const { currentTrackIndex } = get();
    if (currentTrackIndex > 0) {
      set({ currentTrackIndex: currentTrackIndex - 1, isPlaying: true, progress: 0 });
    }
  },
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),

  isRightPanelVisible: true,
  toggleRightPanel: () => set((state) => ({ isRightPanelVisible: !state.isRightPanelVisible })),
}));
