import React, { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { musicApi } from "../api/music-api.ts"
import type { Track } from "../types/music.ts"

interface TrackEditFormProps {
  track: Track
  onSuccess: () => void
}

export function TrackEditForm({ track, onSuccess }: TrackEditFormProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(track.title)
  const [artist, setArtist] = useState(track.artist)
  const [album, setAlbum] = useState(track.album || "")
  const [isPublic, setIsPublic] = useState(track.isPublic)

  // Track replacement binaries
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null)
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(track.duration)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    }
  }, [coverPreviewUrl])

  const updateMutation = useMutation({
    mutationFn: musicApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-music"] })
      onSuccess()
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Update failed")
    },
  })

  const handleAudioReplacement = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setNewAudioFile(file);

    const url = URL.createObjectURL(file);
    const isVideoFile = file.type.includes('video') || file.name.endsWith('.mp4');

    // Dynamic metadata duration inspector engine
    const mediaContext = isVideoFile ? document.createElement('video') : new Audio();
    mediaContext.src = url;
    mediaContext.onloadedmetadata = () => {
      setDuration(Math.round(mediaContext.duration));
      URL.revokeObjectURL(url);
    };
  }
};

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateMutation.mutate({
      id: track.id,
      dto: {
        title,
        artist,
        album: album || undefined,
        isPublic,
        audio: newAudioFile || undefined,
        cover: newCoverFile || undefined,
        duration,
      },
    })
  }

  const currentCoverUrl = track.coverUrl
    ? track.coverUrl.startsWith("http")
      ? track.coverUrl
      : `http://localhost:5001/${track.coverUrl}`
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">
          Artist
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">
          Album Distribution
        </label>
        <input
          type="text"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
          placeholder="e.g. Singles Collection"
        />
      </div>

      {/* Upgrade/Replace High-Quality Audio File */}
      <div className="space-y-1.5 border border-dashed border-slate-800 p-3 rounded-lg">
        <label className="text-xs font-bold text-slate-400 uppercase block">
          Swap Audio File (Lossless/Better MP3)
        </label>
        <input
          type="file"
          accept="audio/mpeg, video/mp4"
          onChange={handleAudioReplacement}
          className="w-full text-xs text-slate-500"
        />
        {newAudioFile && (
          <span className="text-[10px] text-emerald-400 font-bold block">
            New file loaded. Updated duration: {duration}s
          </span>
        )}
      </div>

      {/* Image Preview Box */}
      <div className="flex gap-4 items-center border border-slate-800 p-3 rounded-lg bg-slate-950/20">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">
            Replace Cover Artwork
          </label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setNewCoverFile(e.target.files[0])
                setCoverPreviewUrl(URL.createObjectURL(e.target.files[0]))
              }
            }}
            className="w-full text-xs"
          />
        </div>
        {(coverPreviewUrl || currentCoverUrl) && (
          <img
            src={coverPreviewUrl || currentCoverUrl!}
            alt="Cover"
            className="w-14 h-14 rounded object-cover border border-slate-800"
            crossOrigin="anonymous"
          />
        )}
      </div>

       {/* Is Public */}
      <div className="flex items-center gap-3 py-1">
  <input
    type="checkbox"
    id="isPublic"
    checked={isPublic}
    onChange={(e) => setIsPublic(e.target.checked)}
    className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-800 rounded focus:ring-0 cursor-pointer"
  />
  <label htmlFor="isPublic" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
    Make this track public
  </label>
</div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-lg"
        >
          {updateMutation.isPending ? "Updating..." : "Apply Changes"}
        </button>
      </div>
    </form>
  )
}
