import { useEffect, useRef } from "react"
import { usePlayerStore } from "../../store/usePlayerStore"
import { authApi } from "../../features/auth/api/auth-api"
import { Minimize2 } from "lucide-react"

const API = import.meta.env.VITE_API_URL

type MediaElement = HTMLAudioElement | HTMLVideoElement

export function MediaEngine() {
  // common ref - HTMLMediaElement is the base type for <audio> and <video>
  const mediaRef = useRef<MediaElement | null>(null)

  const { currentTrack, isPlaying, volume, isVideoVisible, setProgress, setDuration, next, toggleVideoVisibility } =
    usePlayerStore()

  const track = currentTrack()
  const isVideo =
    track?.mimeType.toLowerCase().includes("video") ||
    track?.mimeType.toLowerCase().includes("mp4")

    const setMediaRef = (el: MediaElement | null) => {
    mediaRef.current = el
  }

  useEffect(() => {
    if (!mediaRef.current || !track) return

    let cancelled = false

    authApi.getMediaToken().then((token) => {
      if (cancelled || !mediaRef.current) return
      mediaRef.current.src = `${API}/music/stream/${track.id}?token=${token}`
      mediaRef.current.load()
      if (isPlaying) mediaRef.current.play().catch(() => {})
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id])

  useEffect(() => {
    if (!mediaRef.current) return

    if (isPlaying) {
      mediaRef.current.play().catch(() => {})
    } else {
      mediaRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.volume = volume
  }, [volume])

  if (!track) return null

  const handleTimeUpdate = (e: React.SyntheticEvent<MediaElement>) => {
    setProgress(e.currentTarget.currentTime)
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<MediaElement>) => {
    setDuration(e.currentTarget.duration)
  }

  if (!isVideo) {
    // audio always invisible - control is via PlayerBar
    return (
      <audio
        ref={setMediaRef}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => next()}
        className="hidden"
      />
    )
  }

  return (
    <div
      className={
        isVideoVisible
          ? 'fixed bottom-16 right-4 z-40 w-40 sm:w-56 rounded-lg overflow-hidden shadow-lg bg-black'
          : 'sr-only'
      }
    >
      <div className="relative group">
        <video
          ref={setMediaRef}
          preload="none"
          controls
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => next()}
          className="w-full h-24 sm:h-32 object-cover bg-black"
        />
        <button
          onClick={toggleVideoVisibility}
          className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white
                     opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Schowaj podgląd wideo"
        >
          <Minimize2 size={14} />
        </button>
      </div>
    </div>
  )
}
