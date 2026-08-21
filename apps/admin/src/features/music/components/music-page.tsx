import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { musicApi } from "../api/music-api.ts"
import { AdminModal } from "../../../components/admin-modal.tsx"
import { TrackUploadForm } from "./track-upload-form.tsx"
import { TrackEditForm } from "./track-edit-form.tsx"
import type { Track } from "../types/music.ts"
import { MediaPreviewPlayer } from "./media-preview-player.tsx"

export function MusicPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Defensive pagination value

  // Modals visibility triggers
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)

  // Play Track
  const [activePlayingTrack, setActivePlayingTrack] = useState<Track | null>(
    null,
  )

  const {
    data: tracks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-music"],
    queryFn: musicApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: musicApi.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-music"] }),
  })

  // Client-side instant query filtering
  const filteredTracks =
    tracks?.filter(
      (track) =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (track.album &&
          track.album.toLowerCase().includes(searchTerm.toLowerCase())),
    ) || []

  // Slice list dynamically based on calculation
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage)
  const paginatedTracks = filteredTracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Music Database
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Efficient search, track upgrades, pagination, and media validation
            workflows.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-lg transition-transform active:scale-95 self-start sm:self-center"
        >
          ＋ Add New Track
        </button>
      </div>

      {/* Live Filtering and Counter Meta Header */}
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Search track title, album, artist across catalogs..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 bg-slate-950 border border-slate-800 px-4 py-2 text-sm rounded-lg text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
        />
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg uppercase tracking-wider">
          Matches: {filteredTracks.length}
        </span>
      </div>

      {/* Main Scaled Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-12 text-center text-sm text-emerald-400 font-medium animate-pulse">
              Loading sound files...
            </p>
          ) : isError ? (
            <p className="p-12 text-center text-sm text-red-400 font-medium">
              Failed to look up music collection.
            </p>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/20">
                    <th className="py-3.5 px-5">Track Details</th>
                    <th className="py-3.5 px-5">Album</th>
                    <th className="py-3.5 px-5 text-center">Visibility</th>
                    <th className="py-3.5 px-5 text-right">Streams</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {paginatedTracks.length > 0 ? (
                    paginatedTracks.map((track) => {
                      const coverUrl = track.coverUrl
                        ? track.coverUrl.startsWith("http")
                          ? track.coverUrl
                          : `http://localhost:5001/${track.coverUrl}`
                        : null
                      return (
                        <tr
                          key={track.id}
                          className="hover:bg-slate-800/10 transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {coverUrl ? (
                                <img
                                  src={coverUrl}
                                  alt=""
                                  className="w-10 h-10 rounded object-cover border border-slate-800"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-lg">
                                  🎵
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-white leading-tight">
                                  {track.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {track.artist}{" "}
                                  <span className="text-slate-600 font-mono ml-1">
                                    ({track.duration}s)
                                  </span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-400">
                            {track.album || (
                              <span className="text-slate-600 italic">
                                None
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${track.isPublic ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                            >
                              {track.isPublic ? "Public" : "Private"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono text-slate-300">
                            {track.playCount.toLocaleString()}
                          </td>
                          {/* ACTIONS */}

                          <td className="py-3.5 px-5 text-right flex items-center justify-end gap-3 h-full min-w-[320px]">
                            <button
                              onClick={() => setActivePlayingTrack(track)}
                              className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 flex items-center justify-center border border-emerald-500/20 hover:border-emerald-500 transition-all font-bold text-xs"
                              title="Listen to stream"
                            >
                              ▶
                            </button>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingTrack(track)}
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/30 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete ${track.title}?`))
                                    deleteMutation.mutate(track.id)
                                }}
                                className="text-xs font-bold text-slate-500 hover:text-red-400 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-red-900/30 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-slate-500 font-medium"
                      >
                        No tracks matched your query criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Robust Pagination Control Bar Layout */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Structural Upload Modal */}
      <AdminModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Music Content Asset"
      >
        <TrackUploadForm onSuccess={() => setIsUploadOpen(false)} />
      </AdminModal>

      {/* Structural Edit Modal */}
      <AdminModal
        isOpen={!!editingTrack}
        onClose={() => setEditingTrack(null)}
        title="Modify Library Track Track Metadata"
      >
        {editingTrack && (
          <TrackEditForm
            track={editingTrack}
            onSuccess={() => setEditingTrack(null)}
          />
        )}
      </AdminModal>

      {/* Dynamic Media Player Streaming Modal */}
<AdminModal 
  isOpen={!!activePlayingTrack} 
  onClose={() => setActivePlayingTrack(null)} 
  title={`Streaming: ${activePlayingTrack?.title || ''}`}
>
  {activePlayingTrack && (
    <MediaPreviewPlayer 
      trackId={activePlayingTrack.id} 
      mimeType={activePlayingTrack.mimeType} 
    />
  )}
</AdminModal>
    </div>
  )
}
