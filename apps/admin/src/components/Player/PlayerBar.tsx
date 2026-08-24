import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { ProgressBar } from './ProgressBar'

export function PlayerBar() {
  const { currentTrack, isPlaying, togglePlay, next, prev, volume, setVolume, isVideoVisible, toggleVideoVisibility } = usePlayerStore()

  const track = currentTrack()
  const IMAGE_URL = import.meta.env.VITE_BACKEND_URL
  if (!track) return null // nothing works -> the bar does not render

  const isVideo =
    track.mimeType.toLowerCase().includes('video') ||
    track.mimeType.toLowerCase().includes('mp4')

  const showRestoreButton = isVideo && !isVideoVisible

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50
                 bg-slate-950/95 backdrop-blur border-t border-slate-800
                 px-3 py-2 sm:px-4"
    >
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        {/* Cover + info */}
        <div className="flex items-center gap-3 min-w-0 w-1/3 sm:w-1/4">
          <img
            src={`${IMAGE_URL}/${track.coverUrl}`}
            alt={track.title}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover shrink-0 bg-slate-800"
          />
          <div className="min-w-0 xs:block">
            <p className="text-sm font-semibold text-white truncate">
              {track.title}
            </p>
            <p className="text-xs text-slate-400 truncate">{track.artist}</p>
          </div>

          {/* Przywróć podgląd wideo */}
          {showRestoreButton && (
            <button
              onClick={toggleVideoVisibility}
              className="flex-shrink-0 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Pokaż podgląd wideo"
              title="Pokaż podgląd wideo"
            >
              <Maximize2 size={14} />
            </button>
          )}

        </div>

        {/* Controlls + progress */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={prev}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center
                         hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause size={16} className="text-black" fill="black" />
              ) : (
                <Play size={16} className="text-black ml-0.5" fill="black" />
              )}
            </button>

            <button
              onClick={next}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          {/* On mobile, we hide the progress bar under the controls to save space - optional */}
          <div className="w-full hidden sm:block">
            <ProgressBar />
          </div>
        </div>

        {/* Volume - desktop only, on mobile it is controlled with physical buttons anyway */}
        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
          <Volume2 size={16} className="text-slate-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 rounded-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Progress bar on mobile - full width underneath */}
      <div className="sm:hidden mt-1.5">
        <ProgressBar />
      </div>
    </div>
  )
}