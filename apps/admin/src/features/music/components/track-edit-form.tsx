import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicApi } from '../api/music-api.ts';
import type { Track } from '../types/music.ts';

interface TrackEditFormProps {
  track: Track;
  onSuccess: () => void;
}

export function TrackEditForm({ track, onSuccess }: TrackEditFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album || '');
  const [isPublic, setIsPublic] = useState(track.isPublic);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: musicApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to update track resources');
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError('Title and Artist metadata cannot be empty.');
      return;
    }

    updateMutation.mutate({
      id: track.id,
      dto: {
        title,
        artist,
        album: album || undefined,
        isPublic,
        cover: coverFile || undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Track Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Artist</label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Album</label>
        <input
          type="text"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Replace Cover Asset</label>
        <input
          type="file"
          accept="image/jpeg, image/png"
          onChange={(e) => e.target.files && setCoverFile(e.target.files[0])}
          className="w-full text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          id="modalIsPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 text-emerald-500 bg-slate-950 border-slate-800 rounded focus:ring-0 cursor-pointer"
        />
        <label htmlFor="modalIsPublic" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
          Keep track visible to public
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Track'}
        </button>
      </div>
    </form>
  );
}
