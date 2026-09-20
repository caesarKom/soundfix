// apps/admin/src/features/playlists/components/PlaylistTrackManager.tsx
import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query"
import { musicApi } from "../../music/api/music-api.ts"
import { playlistsApi } from "../api/playlists-api.ts"
import type { AdminPlaylist } from "../types/playlists.ts"
import type { Track } from "@/features/music/types/music.ts"

interface PlaylistTrackManagerProps {
  playlist: AdminPlaylist
  onClose: () => void
}

export function PlaylistTrackManager({
  playlist,
  onClose,
}: PlaylistTrackManagerProps) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Compact view for modal scalability

  // 1. Fetch all tracks available in the entire system database
    const {
    data: dataTracks,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<Track[], Error, InfiniteData<Track[], number>, [string | null], number>({
    queryKey: ["admin-music"],
    queryFn: musicApi.getAll,
    initialPageParam:1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 20) return undefined
      return allPages.length + 1
    },
    staleTime: 1000 * 60 * 5,
  })

  const allTracks = useMemo(() => {
    if(!dataTracks || !dataTracks.pages) return [];
    return dataTracks.pages.flatMap((page) => page )
  }, [dataTracks])

    useEffect(() => {
      const currentMaxItemsNeeded = currentPage * itemsPerPage;
      if (allTracks.length < currentMaxItemsNeeded && hasNextPage) {
        fetchNextPage();
      }
    }, [currentPage, allTracks.length, hasNextPage, fetchNextPage])

  // 2. FIXED: Fetch fresh paginated songs for this playlist to accurately determine assignment states
  // We set a high limit (e.g., 1000) or use page 1 because this is an admin manager view
  const { data: assignedSongs } = useQuery({
    queryKey: ["admin-playlist-songs-manager", playlist.id],
    queryFn: () => playlistsApi.getListSongs(playlist.id, 1),
  })

  // Mutation to assign track
  const addTrackMutation = useMutation({
    mutationFn: (trackId: string) =>
      playlistsApi.addTrack(playlist.id, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-playlist-songs-manager", playlist.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["admin-playlist-songs", playlist.id],
      })
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] })
    },
  })

  // Mutation to remove track from playlist context
  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) =>
      playlistsApi.removeTrack(playlist.id, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-playlist-songs-manager", playlist.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["admin-playlist-songs", playlist.id],
      })
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] })
    },
  })

  // FIXED: Safely maps IDs from the fresh server response or safeguards with fallback arrays
  const currentAssignedIds = new Set(
    Array.isArray(assignedSongs)
      ? assignedSongs.map((s: any) => s.id)
      : (assignedSongs as any)?.songs?.map((s: any) => s.id) || []
  )

  const filteredTracks =
    allTracks?.filter(
      (track) =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage)
  const paginatedTracks = filteredTracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleToggle = (trackId: string, isLinked: boolean) => {
    if (isLinked) {
      removeTrackMutation.mutate(trackId)
    } else {
      addTrackMutation.mutate(trackId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Instant Search Filtering Input Box */}
      <input
        type="text"
        placeholder="Search track by title or artist..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setCurrentPage(1)
        }}
        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-sm rounded-lg text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
      />

      <div className="space-y-2">
        {isLoading ? (
          <p className="text-xs text-center text-emerald-400 animate-pulse py-4">
            Loading application track base...
          </p>
        ) : paginatedTracks.length > 0 ? (
          paginatedTracks.map((track) => {
            const isLinked = currentAssignedIds.has(track.id)
            const isWorking =
              addTrackMutation.isPending || removeTrackMutation.isPending

            return (
              <div
                key={track.id}
                className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {track.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {track.artist}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => handleToggle(track.id, isLinked)}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg border tracking-wide uppercase transition-all duration-200 active:scale-95 ${
                    isLinked
                      ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-slate-950 shadow-md shadow-red-950/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950"
                  }`}
                >
                  {isLinked ? "✕ Remove Track" : "＋ Add to Playlist"}
                </button>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-center text-slate-500 py-4 italic">
            No tracks matched criteria.
          </p>
        )}
      </div>

      {/* Internal Pagination Row */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2 py-1 text-[11px] font-bold bg-slate-800 disabled:opacity-30 rounded"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 py-1 text-[11px] font-bold bg-slate-800 disabled:opacity-30 rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
        >
          Finish Configuration
        </button>
      </div>
    </div>
  )
}
