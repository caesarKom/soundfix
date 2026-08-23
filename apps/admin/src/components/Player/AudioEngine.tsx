import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { authApi } from '../../features/auth/api/auth-api'

const API = import.meta.env.VITE_API_URL

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const {
    currentTrack,
    isPlaying,
    volume,
    setProgress,
    setDuration,
    next,
  } = usePlayerStore()

  const track = currentTrack()

  // Change song -> new src, old stream is interrupted by browser
   useEffect(() => {
    if (!audioRef.current || !track) return

    let cancelled = false

    authApi.getMediaToken().then((token) => {
      if (cancelled || !audioRef.current) return
      audioRef.current.src = `${API}/music/stream/${track.id}?token=${token}`
      audioRef.current.load()
      if (isPlaying) audioRef.current.play().catch(() => {})
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id])

  // Play / pauze
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return (
    <audio
      ref={audioRef}
      preload="none" // <- it doesn't download anything until the user hits play
      onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      onEnded={() => next()}
      className="hidden"
    />
  )
}