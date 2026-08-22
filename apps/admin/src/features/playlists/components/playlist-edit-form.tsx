import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsApi } from '../api/playlists-api.ts';
import type { AdminPlaylist } from '../types/playlists.ts';

interface PlaylistEditFormProps {
  playlist: AdminPlaylist;
  onSuccess: () => void;
}

export function PlaylistEditForm({ playlist, onSuccess }: PlaylistEditFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || '');
  const [isPrivate, setIsPrivate] = useState(playlist.isPrivate);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  const updateMutation = useMutation({
    mutationFn: playlistsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-playlists'] });
      queryClient.invalidateQueries({ queryKey: ['admin-playlist-details', playlist.id] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Update failed');
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Playlist name cannot be empty.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('isPrivate', String(isPrivate));
    if (newCoverFile) {
      formData.append('cover', newCoverFile);
    }

    updateMutation.mutate({ id: playlist.id, formData });
  };

  const currentCoverUrl = playlist.coverUrl
    ? (playlist.coverUrl.startsWith('http') ? playlist.coverUrl : `http://localhost:5001/${playlist.coverUrl}`)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-900 rounded-lg">{error}</div>}

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">Playlist Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" />
      </div>

      <div className="flex gap-4 items-center border border-slate-800 p-3 rounded-lg bg-slate-950/20">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Replace Cover Image</label>
          <input type="file" accept="image/jpeg, image/png" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setNewCoverFile(e.target.files[0]);
              setCoverPreviewUrl(URL.createObjectURL(e.target.files[0]));
            }
          }} className="w-full text-xs" />
        </div>
        {(coverPreviewUrl || currentCoverUrl) && (
          <img src={coverPreviewUrl || currentCoverUrl!} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-800 shadow-md" crossOrigin="anonymous" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="editIsPrivate" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-slate-950 border border-slate-800 rounded cursor-pointer focus:ring-0" />
        <label htmlFor="editIsPrivate" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">Private Collection</label>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
        <button type="button" onClick={onSuccess} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg">Cancel</button>
        <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-lg">{updateMutation.isPending ? 'Saving...' : 'Apply Changes'}</button>
      </div>
    </form>
  );
}
