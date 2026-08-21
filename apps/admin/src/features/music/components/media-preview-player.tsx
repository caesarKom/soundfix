import { useEffect, useState } from 'react'
import { musicApi } from '../api/music-api'

interface MediaPreviewPlayerProps {
  trackId: string
  mimeType: string
}

export function MediaPreviewPlayer({ trackId, mimeType }: MediaPreviewPlayerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const isVideo =
    mimeType.toLowerCase().includes('video') ||
    mimeType.toLowerCase().includes('mp4')

  useEffect(() => {
    let currentUrl: string | null = null

    musicApi.fetchTrackBlob(trackId)
      .then((url) => {
        currentUrl = url
        setBlobUrl(url)
      })
      .catch(() => setError(true))

    // sprzątanie: zwalniamy pamięć po odmontowaniu komponentu
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl)
    }
  }, [trackId])

  if (error) {
    return <span className="text-[9px] text-red-400">Błąd ładowania</span>
  }

  if (!blobUrl) {
    return <span className="text-[9px] text-slate-400">Ładowanie...</span>
  }

  if (isVideo) {
    return (
      <div className="inline-flex flex-col items-center gap-1 bg-slate-950 p-1.5 border border-slate-800 rounded-lg shadow-inner">
        <video
          src={blobUrl}
          controls
          className="w-32 h-20 rounded object-cover bg-black"
        />
        <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">
          Video Stream
        </span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 bg-slate-950/60 px-2 py-1.5 border border-slate-800 rounded-lg">
      <audio
        src={blobUrl}
        controls
        className="w-40 h-6 accent-emerald-500 text-xs"
      />
      <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
        Audio Stream
      </span>
    </div>
  )
}