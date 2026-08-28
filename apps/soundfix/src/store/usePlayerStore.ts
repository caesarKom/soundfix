import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  streamUrl: string;
  duration: number; // Duration in seconds
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Track[];
  
  // Actions
  setTrack: (track: Track) => void;
  setPlaying: (isPlaying: boolean) => void;
  updatePosition: (position: number, duration: number) => void;
  setQueue: (queue: Track[]) => void;
  resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],

  setTrack: (track) => set({ currentTrack: track, position: 0 }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  updatePosition: (position, duration) => set({ position, duration }),
  setQueue: (queue) => set({ queue }),
  resetPlayer: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      queue: [],
    }),
}));