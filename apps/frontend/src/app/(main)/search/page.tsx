"use client"

import { useState, ChangeEvent, useEffect } from "react"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { musicService, MusicTrack } from "@/services/music.service"
import { usePlayerStore } from "@/store/player.store"
import { ENV } from "@/config/env.config"
import { Search, Play, Pause, Clock, Heart } from "lucide-react"

const BROWSE_CATEGORIES = [
  { id: "1", title: "Podcasts", color: "bg-emerald-700" },
  { id: "2", title: "Made For You", color: "bg-blue-600" },
  { id: "3", title: "New Releases", color: "bg-pink-600" },
  { id: "4", title: "Pop", color: "bg-purple-600" },
  { id: "5", title: "Hip-Hop", color: "bg-orange-600" },
  { id: "6", title: "Rock", color: "bg-red-600" },
]

export default function SearchPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const { setTrack, currentTrack, isPlaying, playTrack, pauseTrack } =
    usePlayerStore()

  const { data: playlists = [] } = useQuery({
    queryKey: ["userPlaylists"],
    queryFn: musicService.getUserPlaylists,
  })

  const addSongMutation = useMutation({
    mutationFn: ({
      playlistId,
      musicId,
    }: {
      playlistId: string
      musicId: string
    }) => musicService.addSongToPlaylist(playlistId, musicId),
    onSuccess: () => {
      alert("Song added to playlist successfully!")
    },
  })

  // Fetch list of user liked songs to cross-reference heart active states
  const { data: likedSongs = [] } = useQuery<MusicTrack[]>({
    queryKey: ["likedSongs"],
    queryFn: musicService.getLikedTracks,
  })

  // Execute conditional search query fetching from backend with debouncing mechanism
  const { data: searchData, refetch } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => musicService.searchTracks(searchQuery),
    enabled: searchQuery.trim() !== "",
  })

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== "") refetch()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery, refetch])

  // Mutation handler to toggle song like state and invalidate cache instantly
  const likeMutation = useMutation({
    mutationFn: (trackId: string) => musicService.toggleLikeTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedSongs"] })
    },
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const searchResults = searchData?.songs || []

  const handleTrackClick = (track: MusicTrack, index: number) => {
    if (currentTrack()?.id === track.id) {
      if (isPlaying) pauseTrack()
      else playTrack()
    } else {
      const formattedQueue = searchResults.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: t.duration,
        coverUrl: t.coverUrl,
        audioUrl: t.audioUrl,
        mimeType: "audio/mpeg",
      }))
      setTrack(formattedQueue[index], formattedQueue, index)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")
    return `${mins}:${secs}`
  }

  return (
    <div className="p-6 bg-spotify-base min-h-full">
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
                <span className="text-xl font-bold tracking-tight text-spotify-white block wrap-break-word max-w-[80%]">
                  {category.title}
                </span>
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
                  <th className="py-2 w-24 text-center">Actions</th>
                  <th className="py-2 w-16 text-center">
                    <Clock size={16} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((track, index) => {
                  const isCurrent = currentTrack()?.id === track.id
                  const isLiked = likedSongs.some((s) => s.id === track.id)
                  return (
                    <tr
                      key={track.id}
                      onClick={() => handleTrackClick(track, index)}
                      className="group hover:bg-spotify-white/10 rounded transition duration-200 cursor-pointer text-sm text-spotify-muted hover:text-spotify-white"
                    >
                      <td className="py-3 text-center font-medium w-12 text-xs">
                        {isCurrent ? (
                          isPlaying ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                pauseTrack()
                              }}
                              className="text-spotify-green hover:scale-110 transition cursor-pointer flex items-center justify-center w-full"
                            >
                              <Pause size={14} fill="#1DB954" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                playTrack()
                              }}
                              className="text-spotify-green hover:scale-110 transition cursor-pointer flex items-center justify-center w-full"
                            >
                              <Play
                                size={14}
                                fill="#1DB954"
                                className="ml-0.5"
                              />
                            </button>
                          )
                        ) : (
                          <>
                            <span className="group-hover:hidden">
                              {index + 1}
                            </span>
                            <button className="hidden group-hover:flex items-center justify-center w-full text-spotify-white hover:scale-110 transition cursor-pointer">
                              <Play size={12} fill="white" className="ml-0.5" />
                            </button>
                          </>
                        )}
                      </td>
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
                      <td className="py-3 hidden md:table-cell truncate max-w-50">
                        {track.album}
                      </td>
                      {/* Add Like */}
                      <td className="py-3 text-center w-24">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            likeMutation.mutate(track.id)
                          }}
                          className={`cursor-pointer transition hover:scale-115 ${isLiked ? "text-spotify-green" : "text-spotify-muted opacity-0 group-hover:opacity-100 hover:text-spotify-white"}`}
                        >
                          <Heart
                            size={16}
                            fill={isLiked ? "#1DB954" : "none"}
                          />
                        </button>

                        {/* Add to playlist */}
                        {playlists.length > 0 && (
                          <div className="relative group/select">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addSongMutation.mutate({
                                    playlistId: e.target.value,
                                    musicId: track.id,
                                  })
                                  e.target.value = "" // Reset
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-spotify-highlight border border-spotify-press text-xs rounded p-1 text-spotify-muted hover:text-spotify-white focus:outline-none cursor-pointer max-w-25 truncate opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <option value="">Add to...</option>
                              {playlists.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>

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
