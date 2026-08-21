interface MediaPreviewPlayerProps {
  trackId: string;
  title: string;
}

export function MediaPreviewPlayer({ trackId, title }: MediaPreviewPlayerProps) {

    const API = import.meta.env.VITE_API_URL;

  if (!trackId) {
    return (
      <div className="inline-flex items-center bg-slate-950/40 px-3 py-1 border border-slate-800 rounded-lg text-xs text-slate-600 italic">
        No media file
      </div>
    );
  }

  // 1. Direct secure link to your NestJS streaming endpoint
  const streamUrl = `${API}/music/stream/${trackId}`;
  
  // 2. Detect if the original file was a video clip
  const isVideo = audioUrl.toLowerCase().endsWith('.mp4');

  if (isVideo) {
    return (
      <div className="inline-flex flex-col items-center gap-1 bg-slate-950 p-1.5 border border-slate-800 rounded-lg shadow-inner">
        <video 
          src={streamUrl} 
          controls 
          className="w-32 h-20 rounded object-cover bg-black"
          crossOrigin="anonymous"
        />
        <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">Video Stream</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-slate-950/60 px-2 py-1.5 border border-slate-800 rounded-lg">
      <audio 
        src={streamUrl} 
        controls 
        className="w-40 h-6 accent-emerald-500 text-xs" 
        crossOrigin="anonymous"
      />
      <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">Audio Stream</span>
    </div>
  );
}
