"use client"

import Link from "next/link"
import Image from "next/image"
import { Home, Search, Library, LogOut, Plus } from "lucide-react"
import { musicService } from "@/services/music.service"
import { ENV } from "@/config/env.config"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { authService } from "@/services/auth.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function Sidebar() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { clearAuth, user } = useAuthStore()

  const { data: playlists = [] } = useQuery({
    queryKey: ["userPlaylists"],
    queryFn: musicService.getUserPlaylists,
  })

  const handleLogoutClick = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error(
        "Backend logout failed, clearing frontend session anyway",
        err,
      )
    } finally {
      clearAuth()
      router.push("/login")
    }
  }

  const playlistCount = playlists.length + 1

  const createPlaylistMutation = useMutation({
    mutationFn: () =>
      musicService.createPlaylist({
        name: `My Playlist #${playlistCount}`,
        description: "New custom playlist created by user.",
        isPrivate: false,
      }),
    onSuccess: (newPlaylist) => {
      // refreshing the playlist list in the sidebar
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] })
      // redirect the user directly to the newly created playlist
      router.push(`/playlist/${newPlaylist.id}`)
    },
  })

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* navigation */}
      <div className="bg-spotify-base rounded-lg p-5 space-y-4 flex flex-col items-center md:items-start">
        <Link
          href="/home"
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition w-full justify-center md:justify-start"
        >
          <Home size={24} />
          {/* hidden on mobile */}
          <span className="hidden md:inline">Home</span>
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition w-full justify-center md:justify-start"
        >
          <Search size={24} />
          <span className="hidden md:inline">Search</span>
        </Link>
      </div>

      {/* Library */}
      <div className="flex-1 bg-spotify-base rounded-lg p-5 flex flex-col overflow-hidden items-center md:items-start">
        <div className="flex items-center gap-3 text-spotify-muted mb-4 w-full justify-center md:justify-start">
          <Library size={24} />
          <span className="text-sm font-bold hidden md:inline">
            Your Library
          </span>

          {/* Add new playlist */}
          <button
            onClick={() => createPlaylistMutation.mutate()}
            className="hidden md:flex items-center justify-center p-1 rounded-full text-spotify-muted hover:text-spotify-white hover:bg-spotify-highlight transition cursor-pointer"
            title="Create playlist"
          >
            <Plus size={20} />
          </button>
        </div>
        {/* Playlists */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar w-full">
          {playlists.length === 0 ? (
            <div className="text-xs text-spotify-muted px-2 py-4 text-center md:text-left hidden md:block">
              No playlists created yet.
            </div>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-highlight transition group justify-center md:justify-start"
              >
                <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                  <Image
                    src={ENV.getMediaUrl(playlist.coverUrl)}
                    alt={playlist.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {/* Hidend text on hover for mobile view */}
                <div className="overflow-hidden hidden md:block">
                  <p className="text-sm font-medium text-spotify-white truncate group-hover:text-spotify-green transition">
                    {playlist.name}
                  </p>
                  <p className="text-xs text-spotify-muted truncate">
                    Playlist
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Profile and logout */}
      <div className="bg-spotify-base rounded-lg p-4 flex flex-col gap-2 items-center md:items-start mt-auto">
        <div className="flex items-center gap-3 w-full justify-center md:justify-start px-2 py-1">
          <div className="w-7 h-7 rounded-full bg-spotify-green flex items-center justify-center text-spotify-black font-bold text-xs shrink-0 select-none">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium text-spotify-white truncate hidden md:inline">
            {user?.name || "User Account"}
          </span>
        </div>

        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-red-500 transition w-full justify-center md:justify-start p-2 rounded hover:bg-spotify-highlight cursor-pointer"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Log Out</span>
        </button>
      </div>
    </div>
  )
}
