"use client"

import { useEffect, useState } from "react"
import { musicService, MusicTrack } from "@/services/music.service"
import { usePlayerStore } from "@/store/player.store"
import { Play } from "lucide-react"
import Image from "next/image"
import { ENV } from "@/config/env.config"
import { useAuthStore } from "@/store/auth.store"

export default function HomePage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore()
  const { user } = useAuthStore()

  // Calculate greeting dynamically during render phase to avoid cascading renders
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  useEffect(() => {
    musicService
      .getPublicTracks()
      .then(setTracks)
      .catch((err) => console.error("Failed to load tracks", err))
  }, [])

  const handleTrackClick = (track: MusicTrack, index: number) => {
    if (currentTrack()?.id === track.id) {
      togglePlay()
    } else {
      const formattedQueue = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: t.duration,
        coverUrl: t.coverUrl,
        audioUrl: t.audioUrl,
        mimeType: t.mimeType,
      }))

      setTrack(formattedQueue[index], formattedQueue, index)
    }
  }

  return (
    <div className="p-6 bg-linear-to-b from-spotify-highlight to-spotify-base min-h-full">
      <h1 className="text-3xl font-bold mb-6 tracking-tight text-spotify-white">
        {greeting} {user?.name}{" "}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tracks.slice(0, 6).map((track, index) => (
          <div
            key={`quick-${track.id}`}
            onClick={() => handleTrackClick(track, index)}
            className="flex items-center bg-spotify-white/5 hover:bg-spotify-white/10 rounded-md overflow-hidden transition duration-300 cursor-pointer group relative pr-20"
          >
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={ENV.getMediaUrl(track.coverUrl)}
                alt={track.title}
                fill
                sizes="80px"
                className="object-cover"
                loading="eager"
                unoptimized
              />
            </div>
            <div className="p-4 overflow-hidden">
              <p className="font-bold text-sm text-spotify-white truncate">
                {track.title}
              </p>
              <p className="text-xs text-spotify-muted truncate mt-1">
                {track.artist}
              </p>
            </div>
            <button className="absolute right-4 w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center shadow-xl opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 cursor-pointer">
              {currentTrack()?.id === track.id && isPlaying ? (
                <div className="flex gap-1 items-end justify-center h-4">
                  <div className="w-1 bg-spotify-black h-full animate-pulse" />
                  <div className="w-1 bg-spotify-black h-2 animate-pulse [animation-delay:0.2s]" />
                  <div className="w-1 bg-spotify-black h-3 animate-pulse [animation-delay:0.4s]" />
                </div>
              ) : (
                <Play
                  size={20}
                  fill="black"
                  className="ml-1 text-spotify-black"
                />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-spotify-white hover:underline cursor-pointer inline-block">
          Recommended for you
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              onClick={() => handleTrackClick(track, index)}
              className="bg-spotify-highlight/40 hover:bg-spotify-highlight p-4 rounded-md transition duration-300 cursor-pointer group relative"
            >
              <div className="relative mb-4 aspect-square w-full shadow-lg">
                <Image
                  src={ENV.getMediaUrl(track.coverUrl)}
                  alt={track.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover"
                  loading="eager"
                  unoptimized
                />
                <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl cursor-pointer">
                  <Play
                    size={16}
                    fill="black"
                    className="ml-0.5 text-spotify-black"
                  />
                </button>
              </div>
              <div className="min-h-15.5">
                <h3 className="font-bold text-sm text-spotify-white truncate mb-1">
                  {track.title}
                </h3>
                <p className="text-xs text-spotify-muted line-clamp-2">
                  {track.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
