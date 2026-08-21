import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicApi } from '../api/music-api.ts';

interface TrackUploadFormProps {
  onSuccess: () => void;
}

export function TrackUploadForm({ onSuccess }: TrackUploadFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // Custom interactive UX/UI previews
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Auto clean up blobs to avoid browser memory leaks
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [audioPreviewUrl, coverPreviewUrl]);

  const uploadMutation = useMutation({
    mutationFn: musicApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-music'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Upload failed');
    },
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);

      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);

      const audioContext = new Audio(url);
      audioContext.onloadedmetadata = () => {
        setDuration(Math.round(audioContext.duration));
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !audioFile) {
      setError('Title, Artist and Audio file are mandatory fields.');
      return;
    }
    uploadMutation.mutate({
      title,
      artist,
      album: album || undefined,
      isPublic,
      audio: audioFile,
      cover: coverFile || undefined,
      duration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      {error && <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm" placeholder="Blinding Lights" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Artist</label>
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm" placeholder="The Weeknd" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-400 uppercase">Album (Optional)</label>
        <input type="text" value={album} onChange={(e) => setAlbum(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm" placeholder="After Hours" />
      </div>

      {/* Audio upload and local pre-listen preview controller */}
      <div className="space-y-2 border border-slate-800/80 p-3 rounded-lg bg-slate-950/30">
        <label className="text-xs font-bold text-slate-400 uppercase block">Audio Source (.mp3)</label>
        <input type="file" accept="audio/mpeg" onChange={handleAudioChange} className="w-full text-xs text-slate-400" />
        {audioPreviewUrl && (
          <div className="pt-2 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-400">Pre-verify Audio Asset:</span>
            <audio src={audioPreviewUrl} controls className="w-full h-8 accent-emerald-500" />
          </div>
        )}
      </div>

      {/* Cover upload and image display box */}
      <div className="space-y-2 border border-slate-800/80 p-3 rounded-lg bg-slate-950/30 flex gap-4 items-center">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Cover Art Image</label>
          <input type="file" accept="image/jpeg, image/png" onChange={handleCoverChange} className="w-full text-xs text-slate-400" />
        </div>
        {coverPreviewUrl && (
          <img src={coverPreviewUrl} alt="Preview" className="w-16 h-16 rounded object-cover border border-slate-800 shadow-md" />
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
        <button type="button" onClick={onSuccess} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-lg">Cancel</button>
        <button type="submit" disabled={uploadMutation.isPending} className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-lg hover:bg-emerald-600">
          {uploadMutation.isPending ? 'Publishing...' : 'Publish Track'}
        </button>
      </div>
    </form>
  );
}
