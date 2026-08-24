// store/usePlayerStore.ts
import { create } from 'zustand'
import type { Track } from '../features/music/types/music'

interface PlayerState {
  queue: Track[]
  currentIndex: number
  isPlaying: boolean
  progress: number      // sek
  duration: number       // sek
  volume: number         // 0-1
  isVideoVisible: boolean
  toggleVideoVisibility: () => void
  isPlayerBarVisible: boolean
  togglePlayerBarVisibility: () => void

  currentTrack: () => Track | null

  playTrack: (track: Track, queue?: Track[]) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  setProgress: (seconds: number) => void
  setDuration: (seconds: number) => void
  setVolume: (v: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 1,
  isVideoVisible: true,
  isPlayerBarVisible: true,

  toggleVideoVisibility: () => set((s) => ({ isVideoVisible: !s.isVideoVisible })),
  togglePlayerBarVisibility: () => set((s) => ({ isPlayerBarVisible: !s.isPlayerBarVisible })),

  currentTrack: () => {
    const { queue, currentIndex } = get()
    return queue[currentIndex] ?? null
  },

  playTrack: (track, queue) => {
    const newQueue = queue ?? [track]
    const index = newQueue.findIndex((t) => t.id === track.id)
    set({
      queue: newQueue,
      currentIndex: index === -1 ? 0 : index,
      isPlaying: true,
      progress: 0,
    })
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, currentIndex } = get()
    if (currentIndex < queue.length - 1) {
      set({ currentIndex: currentIndex + 1, progress: 0, isPlaying: true })
    } else {
      set({ isPlaying: false })
    }
  },

  prev: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, progress: 0, isPlaying: true })
    }
  },

  setProgress: (seconds) => set({ progress: seconds }),
  setDuration: (seconds) => set({ duration: seconds }),
  setVolume: (v) => set({ volume: v }),
}))