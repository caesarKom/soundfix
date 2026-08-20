import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { musicApi } from "../api/music-api.ts"

export function MusicPage() {
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL
  const queryClient = useQueryClient()

  // Form states
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [album, setAlbum] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [duration, setDuration] = useState<number>(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // 1. Query for fetching music catalog
  const {
    data: tracks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-music"],
    queryFn: musicApi.getAll,
  })

  // 2. Mutation for track uploading
  const uploadMutation = useMutation({
    mutationFn: musicApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-music"] })
      setTitle("")
      setArtist("")
      setAlbum("")
      setAudioFile(null)
      setCoverFile(null)
      setValidationError(null)
    },
    onError: (error: unknown) => {
      setValidationError(
        error instanceof Error ? error.message : "Failed to upload track",
      )
    },
  })

  // 3. Mutation for track removal
  const deleteMutation = useMutation({
    mutationFn: musicApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-music"] })
    },
  })

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setAudioFile(file);

    // Create a temporary object URL to read audio metadata
    const audioUrl = URL.createObjectURL(file);
    const audioContext = new Audio(audioUrl);

    audioContext.onloadedmetadata = () => {
      // Math.round to convert floating point seconds to Integer for NestJS/Prisma
      setDuration(Math.round(audioContext.duration));
      
      // Clean up memory by revoking the temporary object URL
      URL.revokeObjectURL(audioUrl);
    };
  }
};

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError(null)

    if (!title || !artist || !audioFile) {
      setValidationError(
        "Title, Artist, and an Audio File are strictly required.",
      )
      return
    }

    uploadMutation.mutate({
      title,
      artist,
      album: album || undefined,
      isPublic,
      audio: audioFile,
      cover: coverFile || undefined,
      duration: duration,
    })
  }

  const handleDelete = (id: string, trackTitle: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${trackTitle}"?`,
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Music Library
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload fresh audio content, organize album distribution, and moderate
          public tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload Form Section */}
        <section className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl space-y-5">
          <h2 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-3">
            Upload New Track
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="p-3 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
                {validationError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Track Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blinding Lights"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Artist
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. The Weeknd"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Album (Optional)
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="e.g. After Hours"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={duration}
                disabled
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Audio File (.mp3)
              </label>
              <input
                type="file"
                accept="audio/mpeg, audio/mp3"
                onChange={handleAudioChange}
                className="w-full text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cover Image (.jpg/.png)
              </label>
              <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleCoverChange}
                className="w-full text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-800 rounded focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="isPublic"
                className="text-sm font-semibold text-slate-300 cursor-pointer select-none"
              >
                Make this track public
              </label>
            </div>

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-black text-sm rounded-lg transition-colors mt-2"
            >
              {uploadMutation.isPending
                ? "Uploading track assets..."
                : "Publish Audio Track"}
            </button>
          </form>
        </section>

        {/* Tracks List Table Section */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Track Database
            </h2>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <p className="p-8 text-center text-sm text-emerald-400 font-medium animate-pulse">
                Loading sound files...
              </p>
            ) : isError ? (
              <p className="p-8 text-center text-sm text-red-400 font-medium">
                Failed to look up music collection.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider bg-slate-950/20">
                    <th className="py-3.5 px-5">Track Details</th>
                    <th className="py-3.5 px-5">Album</th>
                    <th className="py-3.5 px-5 text-center">Visibility</th>
                    <th className="py-3.5 px-5 text-right">Streams</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {tracks && tracks.length > 0 ? (
                    tracks.map((track) => (
                      <tr
                        key={track.id}
                        className="hover:bg-slate-800/10 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {track.coverUrl ? (
                              <img
                                src={`${IMAGE_URL}/${track.coverUrl}`}
                                alt={track.title}
                                crossOrigin="anonymous" // Instructs the browser to fetch the image with CORS headers
                                className="w-10 h-10 rounded object-cover border border-slate-800"
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
                                {track.artist}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 truncate max-w-[120px]">
                          {track.album || (
                            <span className="text-slate-600 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {track.isPublic ? "Public" : "Private"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono text-slate-300">
                          {track.playCount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleDelete(track.id, track.title)}
                            disabled={deleteMutation.isPending}
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
                        colSpan={5}
                        className="py-12 text-center text-slate-500 font-medium"
                      >
                        No audio files stored in the ecosystem yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
