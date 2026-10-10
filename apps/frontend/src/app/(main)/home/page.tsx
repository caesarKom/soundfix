"use client"

import { useEffect, useMemo, useRef } from "react"
import { musicService, MusicTrack } from "@/services/music.service"
import { usePlayerStore } from "@/store/player.store"
import { AlertCircle, Loader2, Play, RefreshCw } from "lucide-react"
import Image from "next/image"
import { ENV } from "@/config/env.config"
import { useAuthStore } from "@/store/auth.store"
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query"

export default function HomePage() {
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore()
  const { user } = useAuthStore()
  // Ref to the invisible Infinite Scroll trigger element
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Calculate greeting dynamically during render phase to avoid cascading renders
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const { data: musicsData, isLoading, isError, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, error } = useInfiniteQuery<MusicTrack[], Error, InfiniteData<MusicTrack[], number>, [string | null], number>({
    queryKey: ["musics"],
    queryFn: (ctx) => musicService.getPublicTracks({ page: ctx.pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 20) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5,
  })

  const tracks = useMemo(() => {
  if (!musicsData || !musicsData.pages) return [];
  
  // 1. flatten all the fetched pages into a single array.
  const allFlattened = musicsData.pages.flatMap((page) => page);
  
  // 2. Safeguard: Remove duplicate objects with the same ID if the backend has sent them again.
  const uniqueTracks = allFlattened.filter(
    (track, index, self) => self.findIndex((t) => t.id === track.id) === index
  );
  
  // 3. Global sorting by popularity on a unique set
  return [...uniqueTracks].sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0));
}, [musicsData])

  // Effect for automatic Infinite Scroll (Intersection Observer)
  useEffect(() => {
    const observerTarget = loadMoreRef.current
    if (!observerTarget || !hasNextPage || isFetchingNextPage || !tracks || tracks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Trigger as soon as the element appears at the bottom of the screen.
    )

    observer.observe(observerTarget)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, tracks?.length])

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-spotify-base text-spotify-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-spotify-green" />
        <p className="text-sm font-medium text-spotify-muted">Loading your music library...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-spotify-base text-spotify-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-spotify-muted max-w-md mb-6">
          {error?.message || "Failed to fetch music tracks. Please check your connection or try again."}
        </p>
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-spotify-white text-spotify-black font-bold text-sm hover:scale-105 transition transform cursor-pointer"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-linear-to-b from-spotify-highlight to-spotify-base min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 tracking-tight text-spotify-white">
        {greeting} {user?.name}{" "}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tracks.slice(0, 6).map((track, index) => (
          <div
            key={`quick-${track.id}-${index}`}
            onClick={() => handleTrackClick(track, index)}
            className="flex items-center bg-spotify-white/5 hover:bg-spotify-white/10 rounded-md overflow-hidden transition duration-300 cursor-pointer group relative"
          >
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src={ENV.getMediaUrl(track.coverUrl)}
                alt={track.title}
                fill
                sizes="80px"
                className="object-cover"
                priority={index < 6}
                loading="eager"
                unoptimized
              />
            </div>
            <div className="p-4 overflow-hidden flex-1">
              <p className="font-bold text-sm text-spotify-white truncate">
                {track.title}
              </p>
              <p className="text-xs text-spotify-muted mt-1">
                {track.artist}
              </p>
              <p className="text-xs text-spotify-muted truncate mt-1">
               played: {track.playCount}
              </p>
            </div>
           <div className="absolute inset-0 bg-spotify-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {currentTrack()?.id === track.id && isPlaying ? (
                <div className="flex gap-1 items-end justify-center h-4">
                  <div className="w-1 bg-spotify-black h-full animate-pulse" />
                  <div className="w-1 bg-spotify-black h-2 animate-pulse [animation-delay:0.2s]" />
                  <div className="w-1 bg-spotify-black h-3 animate-pulse [animation-delay:0.4s]" />
                </div>
              ) : (
                <Play
                    size={24}
                    fill="#1ed760"
                    className="text-spotify-green transform scale-90 group-hover:scale-100 transition-transform duration-300"
                  />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-spotify-white hover:underline cursor-pointer inline-block">
          Recommended for you
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-[60vh]">
          {tracks.map((track, index) => (
            <div
              key={`recommended-${track.id}-${index}`}
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

      {/* HIDDEN checkpoint with forced altitude locking */}
<div ref={loadMoreRef} className="w-full h-20 flex items-center justify-center content-none select-none pointer-events-none">
  {isFetchingNextPage && (
    <Loader2 className="w-6 h-6 animate-spin text-spotify-green" />
  )}
</div>

    </div>
  )
}
