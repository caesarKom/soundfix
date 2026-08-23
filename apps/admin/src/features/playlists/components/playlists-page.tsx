import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { playlistsApi } from "../api/playlists-api.ts"
import { AdminModal } from "../../../components/admin-modal.tsx"
import { PlaylistCreateForm } from "./playlist-create-form.tsx"
import { PlaylistEditForm } from "./playlist-edit-form.tsx"
import { PlaylistTrackManager } from "./playlist-track-manager.tsx"
import type { AdminPlaylist } from "../types/playlists.ts"

export function PlaylistsPage() {
  const queryClient = useQueryClient()
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  )

  // Modal visibility states
  const [isCreateOpen, setIsUploadOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<AdminPlaylist | null>(
    null,
  )
  const [trackManagerPlaylist, setTrackManagerPlaylist] =
    useState<AdminPlaylist | null>(null)

  const {
    data: playlists,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-playlists"],
    queryFn: playlistsApi.getAll,
  })

  const { data: activePlaylist, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["admin-playlist-details", selectedPlaylistId],
    queryFn: () => playlistsApi.getById(selectedPlaylistId!),
    enabled: !!selectedPlaylistId,
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: playlistsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] })
      if (selectedPlaylistId) setSelectedPlaylistId(null)
    },
  })

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) =>
      playlistsApi.removeTrack(selectedPlaylistId!, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-playlist-details", selectedPlaylistId],
      })
    },
  })

  const handleDeletePlaylist = (id: string, name: string) => {
    if (window.confirm(`Permanently delete playlist "${name}"?`)) {
      deletePlaylistMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Application Playlists
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review user collections, manage featured compositions, and publish
            custom global assets.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-lg transition-transform active:scale-95 self-start sm:self-center"
        >
          ＋ Add New Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Playlists Main Registry List Column */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <p className="p-8 text-center text-sm text-emerald-400 animate-pulse">
                  Loading playlists base...
                </p>
              ) : isError ? (
                <p className="p-8 text-center text-sm text-red-400">
                  Failed to look up playlists record.
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/20">
                      <th className="py-3.5 px-5">Playlist Details</th>
                      <th className="py-3.5 px-5">Access status</th>
                      <th className="py-3.5 px-5 text-right">
                        Actions Management
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm">
                    {playlists && playlists.length > 0 ? (
                      playlists.map((playlist) => {
                        const coverUrl = playlist.coverUrl
                          ? playlist.coverUrl.startsWith("http")
                            ? playlist.coverUrl
                            : `http://localhost:5001/${playlist.coverUrl}`
                          : null
                        return (
                          <tr
                            key={playlist.id}
                            className={`hover:bg-slate-800/10 cursor-pointer transition-colors ${selectedPlaylistId === playlist.id ? "bg-slate-800/40 border-l-2 border-emerald-500" : ""}`}
                            onClick={() => setSelectedPlaylistId(playlist.id)}
                          >
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                {coverUrl ? (
                                  <img
                                    src={coverUrl}
                                    alt=""
                                    crossOrigin="anonymous"
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-800 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-lg">
                                    🗂️
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-white leading-tight">
                                    {playlist.name}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-50">
                                    {playlist.description || (
                                      <span className="italic text-slate-600">
                                        No description
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${playlist.isPrivate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
                              >
                                {playlist.isPrivate ? "Private" : "Public"}
                              </span>
                            </td>
                            <td
                              className="py-3.5 px-5 text-right space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setEditingPlaylist(playlist)}
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-950/10"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePlaylist(
                                    playlist.id,
                                    playlist.name,
                                  )
                                }
                                className="text-xs font-bold text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-950/10"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-slate-500"
                        >
                          No playlists registered in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* Selected Composition Side Inspector Column */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          {selectedPlaylistId ? (
            <>
              <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">
                  Track Composition:{" "}
                  <span className="text-emerald-400 block sm:inline">
                    {activePlaylist?.name}
                  </span>
                </h3>
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() =>
                      setTrackManagerPlaylist(activePlaylist || null)
                    }
                    disabled={!activePlaylist}
                    className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 disabled:opacity-40 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 rounded-md transition-all mr-2"
                  >
                    ⚙ Manage
                  </button>
                  <button
                    onClick={() => setSelectedPlaylistId(null)}
                    className="text-xs text-slate-500 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {isLoadingDetails ? (
                  <p className="text-xs text-center text-slate-500 py-6 animate-pulse">
                    Inspecting composition...
                  </p>
                ) : activePlaylist?.songs && activePlaylist.songs.length > 0 ? (
                  <div className="space-y-2">
                    {activePlaylist.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-lg hover:border-slate-700 transition-colors"
                      >
                        <div className="truncate max-w-[70%]">
                          <p className="text-xs font-bold text-white truncate">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {song.artist}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Unlink ${song.title}?`))
                              removeTrackMutation.mutate(song.id)
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-950/10"
                        >
                          Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-slate-500 py-8 italic">
                    This playlist contains no audio tracks.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs font-medium italic">
              Click on any playlist row inside the registry to inspect and
              manage its tracks composition structure.
            </div>
          )}
        </section>
      </div>

      {/* Deploy Playlist Asset Modal */}
      <AdminModal
        isOpen={isCreateOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Create New System Playlist"
      >
        <PlaylistCreateForm onSuccess={() => setIsUploadOpen(false)} />
      </AdminModal>

      {/* Modify Playlist Asset Modal */}
      <AdminModal
        isOpen={!!editingPlaylist}
        onClose={() => setEditingPlaylist(null)}
        title="Modify Playlist Metadata"
      >
        {editingPlaylist && (
          <PlaylistEditForm
            playlist={editingPlaylist}
            onSuccess={() => setEditingPlaylist(null)}
          />
        )}
      </AdminModal>

      {/* Assigner Composition Modal */}
      <AdminModal
        isOpen={!!trackManagerPlaylist}
        onClose={() => setTrackManagerPlaylist(null)}
        title={"Assign Tracks to Composition"}
      >
        {trackManagerPlaylist && (
          <PlaylistTrackManager
            playlist={trackManagerPlaylist}
            onClose={() => setTrackManagerPlaylist(null)}
          />
        )}
      </AdminModal>
    </div>
  )
}
