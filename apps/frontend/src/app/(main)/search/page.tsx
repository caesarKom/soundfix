"use client"

import { useEffect, useState, ChangeEvent } from "react"
import Image from "next/image"
import { musicService, MusicTrack } from "@/services/music.service"
import { usePlayerStore } from "@/store/player.store"
import { ENV } from "@/config/env.config"
import { Search, Play, Pause, Clock } from "lucide-react"

// Mock categories for the default
const BROWSE_CATEGORIES = [
  { id: "1", title: "Podcasts", color: "bg-emerald-700" },
  { id: "2", title: "Made For You", color: "bg-blue-600" },
  { id: "3", title: "New Releases", color: "bg-pink-600" },
  { id: "4", title: "Pop", color: "bg-purple-600" },
  { id: "5", title: "Hip-Hop", color: "bg-orange-600" },
  { id: "6", title: "Rock", color: "bg-red-600" },
  { id: "7", title: "Discover", color: "bg-amber-600" },
  { id: "8", title: "Live Events", color: "bg-teal-600" },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([])
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore()

  useEffect(() => {
    // If the phrase is empty, we clear the results asynchronously to avoid cascading renders
    if (!searchQuery.trim()) {
      setTimeout(() => {
        setSearchResults([])
      }, 0)
      return
    }

    // Debounce for API queries
    const delayDebounce = setTimeout(() => {
      musicService
        .searchTracks(searchQuery)
        .then((data) => {
          // extract the songs array from the response object and pass it to the state
          setSearchResults(data.songs || [])
        })
        .catch((err) => console.error("Search query execution failed", err))
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTrackClick = (track: MusicTrack, index: number) => {
    if (currentTrack()?.id === track.id) {
      togglePlay()
    } else {
      const formattedQueue = searchResults.map((t) => ({
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="p-6 bg-spotify-base min-h-full">
      {/* Sticky top Search Input Bar */}
      <div className="relative w-full max-w-md mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-spotify-muted"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="What do you want to listen to?"
          className="w-full bg-spotify-highlight border border-transparent rounded-full py-3 pl-12 pr-4 text-sm text-spotify-white placeholder-spotify-muted focus:outline-none focus:border-spotify-white focus:ring-1 focus:ring-white transition"
        />
      </div>

      {/* CONDITIONAL RENDER: Browse Categories or Search Results */}
      {searchQuery.trim() === "" ? (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-spotify-white">
            Browse all
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BROWSE_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`${category.color} aspect-square rounded-lg p-4 relative overflow-hidden cursor-pointer hover:brightness-110 transition duration-200 select-none shadow-md`}
              >
                <span className="text-xl font-bold tracking-tight text-spotify-white block wrap-break-words max-w-[80%]">
                  {category.title}
                </span>
                {/* Visual placeholder mimicking Spotify cards angle design */}
                <div className="absolute -bottom-2 -right-6 w-24 h-24 bg-spotify-black/20 rounded rotate-25 transform" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-spotify-white">Songs</h2>
          {searchResults.length === 0 ? (
            <div className="text-sm text-spotify-muted py-10">
              No results found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-spotify-press text-xs font-bold tracking-wider uppercase text-spotify-muted">
                  <th className="py-2 w-12 text-center">#</th>
                  <th className="py-2">Title</th>
                  <th className="py-2 hidden md:table-cell">Album</th>
                  <th className="py-2 w-16 text-center">
                    <Clock size={16} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((track, index) => {
                  const isCurrent = currentTrack()?.id === track.id
                  return (
                    <tr
                      key={track.id}
                      onClick={() => handleTrackClick(track, index)}
                      className="group hover:bg-spotify-white/10 rounded transition duration-200 cursor-pointer text-sm text-spotify-muted hover:text-spotify-white"
                    >
                      {/* PLAY/PAUSE */}
                      <td className="py-3 text-center font-medium w-12 text-xs">
                        {isCurrent ? (
                          isPlaying ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                usePlayerStore.getState().pauseTrack()
                              }}
                              className="text-spotify-green hover:scale-110 transition cursor-pointer flex items-center justify-center w-full"
                            >
                              <Pause
                                size={14}
                                fill="#1DB954"
                                className="text-spotify-green"
                              />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                usePlayerStore.getState().playTrack()
                              }}
                              className="text-spotify-green hover:scale-110 transition cursor-pointer flex items-center justify-center w-full"
                            >
                              <Play
                                size={14}
                                fill="#1DB954"
                                className="text-spotify-green ml-0.5"
                              />
                            </button>
                          )
                        ) : (
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>
                        )}

                        {/* Spotify Effect: Show a small Play icon instead of a number when hovering over an inactive track */}
                        {!isCurrent && (
                          <button className="hidden group-hover:flex items-center justify-center w-full text-spotify-white hover:scale-110 transition cursor-pointer">
                            <Play size={12} fill="white" className="ml-0.5" />
                          </button>
                        )}
                      </td>

                      {/* TITLE AND COVER */}
                      <td className="py-3 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                          <Image
                            src={ENV.getMediaUrl(track.coverUrl)}
                            alt={track.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="overflow-hidden pr-4">
                          <p
                            className={`font-medium truncate ${isCurrent ? "text-spotify-green" : "text-spotify-white"}`}
                          >
                            {track.title}
                          </p>
                          <p className="text-xs truncate group-hover:text-spotify-white transition">
                            {track.artist}
                          </p>
                        </div>
                      </td>

                      {/* ALBUM */}
                      <td className="py-3 hidden md:table-cell truncate max-w-50">
                        {track.album}
                      </td>

                      {/* DURATION */}
                      <td className="py-3 text-center w-16 text-xs font-medium">
                        {formatDuration(track.duration)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
