import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { playlistsApi } from "../api/playlists-api.ts"
import { AdminModal } from "../../../components/admin-modal.tsx"
import { PlaylistTrackManager } from "./playlist-track-manager.tsx"
import type { AdminPlaylist } from "../types/playlists.ts"

export function PlaylistsPage() {
  const queryClient = useQueryClient()

  // Form & Selection states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  const [trackManagerPlaylist, setTrackManagerPlaylist] =
    useState<AdminPlaylist | null>(null)

  //  Query for fetching all global playlists
  const {
    data: playlists,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-playlists"],
    queryFn: playlistsApi.getAll,
  })

  //  Query for fetching single playlist detailed details (tracks inside)
  const { data: activePlaylist, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["admin-playlist-details", selectedPlaylistId],
    queryFn: () => playlistsApi.getById(selectedPlaylistId!),
    enabled: !!selectedPlaylistId,
  })

  //  Mutation for creating a fresh playlist
  const createMutation = useMutation({
    mutationFn: playlistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] })
      setName("")
      setDescription("")
      setIsPrivate(false)
      setErrorMessage(null)
      setCoverFile(null)
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
      setCoverPreviewUrl(null)
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create playlist",
      )
    },
  })

  //  Mutation for deleting a playlist entirely
  const deletePlaylistMutation = useMutation({
    mutationFn: playlistsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] })
      if (selectedPlaylistId) setSelectedPlaylistId(null)
    },
  })

  // 5. Mutation for unlinking a track from a playlist
  const removeTrackMutation = useMutation({
    mutationFn: ({
      playlistId,
      trackId,
    }: {
      playlistId: string
      trackId: string
    }) => playlistsApi.removeTrack(playlistId, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-playlist-details", selectedPlaylistId],
      })
    },
  })

  const handleCreateSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage("Playlist name is strictly required.")
      return
    }

    // PACK EVERYTHING INTO FORMDATA ASSET MULTIPART
    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("isPrivate", String(isPrivate))

    if (coverFile) {
      formData.append("cover", coverFile) // Injected file field binary
    }

    // Execute our multipart handler
    createMutation.mutate(formData)
  }

  const handleDeletePlaylist = (id: string, playlistName: string) => {
    if (
      window.confirm(
        `Are you absolutely sure you want to delete playlist "${playlistName}"?`,
      )
    ) {
      deletePlaylistMutation.mutate(id)
    }
  }

  const handleRemoveTrack = (
    playlistId: string,
    trackId: string,
    trackTitle: string,
  ) => {
    if (window.confirm(`Remove "${trackTitle}" from this playlist?`)) {
      removeTrackMutation.mutate({ playlistId, trackId })
    }
  }

  return (
    <>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Application Playlists
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review user-generated collections, deploy featured global playlists,
            and moderate track compositions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Creation Panel */}
          <section className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-3">
              Deploy Global Playlist
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autumn Chill Hits"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Curated playlist summary details..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Image */}
              <div className="space-y-1.5 border border-slate-850 p-3 rounded-xl bg-slate-950/20 flex gap-4 items-center">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Playlist Cover Art
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0]
                        setCoverFile(file)
                        setCoverPreviewUrl(URL.createObjectURL(file))
                      }
                    }}
                    className="w-full text-xs text-slate-500 cursor-pointer"
                  />
                </div>
                {coverPreviewUrl && (
                  <img
                    src={coverPreviewUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-slate-800 shadow-md"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-800 rounded focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="isPrivate"
                  className="text-sm font-semibold text-slate-300 cursor-pointer select-none"
                >
                  Mark as private playlist
                </label>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-black text-sm rounded-lg transition-colors mt-2"
              >
                {createMutation.isPending
                  ? "Deploying..."
                  : "Publish Global Playlist"}
              </button>
            </form>
          </section>

          {/* Playlists Ecosystem Grid Column */}
          <section className="lg:col-span-2 space-y-8">
            {/* Main Playlists Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  System Playlists Registry
                </h2>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <p className="p-8 text-center text-sm text-emerald-400 font-medium animate-pulse">
                    Loading playlists base...
                  </p>
                ) : isError ? (
                  <p className="p-8 text-center text-sm text-red-400 font-medium">
                    Failed to look up playlists record.
                  </p>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/20">
                        <th className="py-3.5 px-5">Playlist Name</th>
                        <th className="py-3.5 px-5">Access status</th>
                        <th className="py-3.5 px-5 text-right">
                          Actions Management
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-sm">
                      {playlists && playlists.length > 0 ? (
                        playlists.map((playlist) => (
                          <tr
                            key={playlist.id}
                            className={`hover:bg-slate-800/10 cursor-pointer transition-colors ${
                              selectedPlaylistId === playlist.id
                                ? "bg-slate-800/40 border-l-2 border-emerald-500"
                                : ""
                            }`}
                            onClick={() => setSelectedPlaylistId(playlist.id)}
                          >
                            <td className="py-3.5 px-5">
                              <div>
                                <p className="font-bold text-white leading-tight">
                                  {playlist.name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">
                                  {playlist.description || (
                                    <span className="italic text-slate-600">
                                      No description provided
                                    </span>
                                  )}
                                </p>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                  playlist.isPrivate
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {playlist.isPrivate ? "Private" : "Public"}
                              </span>
                            </td>
                            <td
                              className="py-3.5 px-5 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  handleDeletePlaylist(
                                    playlist.id,
                                    playlist.name,
                                  )
                                }
                                className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-950/20"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-12 text-center text-slate-500 font-medium"
                          >
                            No playlists registered in the database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Nested Track Composition View for Selected Playlist */}
            {selectedPlaylistId && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="text-md font-bold text-white tracking-tight">
                    Track Composition:{" "}
                    <span className="text-emerald-400">
                      {activePlaylist?.name}
                    </span>
                  </h3>

                  <button
                    onClick={() => setTrackManagerPlaylist(activePlaylist || null)}
                    className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 rounded-md transition-all mr-2"
                  >
                    ⚙ Manage Playlist Composition
                  </button>

                  <button
                    onClick={() => setSelectedPlaylistId(null)}
                    className="text-xs text-slate-400 hover:text-white font-bold"
                  >
                    Close Inspect
                  </button>
                </div>

                <div className="p-4">
                  {isLoadingDetails ? (
                    <p className="text-sm text-center text-slate-500 py-6 animate-pulse">
                      Inspecting tracks...
                    </p>
                  ) : activePlaylist?.songs &&
                    activePlaylist.songs.length > 0 ? (
                    <div className="space-y-2">
                      {activePlaylist.songs.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">
                              {song.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {song.artist}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveTrack(
                                activePlaylist.id,
                                song.id,
                                song.title,
                              )
                            }
                            disabled={removeTrackMutation.isPending}
                            className="text-xs font-bold text-slate-500 hover:text-red-400 px-2.5 py-1 rounded transition-colors"
                          >
                            Remove Track
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-slate-500 py-8 italic">
                      This playlist does not contain any audio tracks yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <AdminModal
        isOpen={!!trackManagerPlaylist}
        onClose={() => setTrackManagerPlaylist(null)}
        title={`Assign Tracks to: ${trackManagerPlaylist?.name || ""}`}
      >
        {trackManagerPlaylist && (
          <PlaylistTrackManager
            playlist={trackManagerPlaylist}
            onClose={() => setTrackManagerPlaylist(null)}
          />
        )}
      </AdminModal>
    </>
  )
}
