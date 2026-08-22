import { useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'

export function ProgressBar() {
  const { progress, duration, setProgress } = usePlayerStore()
  const [dragValue, setDragValue] = useState<number | null>(null)

  const displayValue = dragValue ?? progress

  const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const handleCommit = (value: number) => {
    const audio = document.querySelector('audio')
    if (audio) audio.currentTime = value // realny seek dopiero tutaj
    setProgress(value)
    setDragValue(null)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">
        {formatTime(displayValue)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={displayValue}
        onChange={(e) => setDragValue(Number(e.target.value))}
        onMouseUp={(e) => handleCommit(Number(e.currentTarget.value))}
        onTouchEnd={(e) => handleCommit(Number(e.currentTarget.value))}
        className="flex-1 h-1 rounded-full accent-emerald-500 cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-emerald-500"
      />
      <span className="text-[10px] text-slate-400 tabular-nums w-8">
        {formatTime(duration)}
      </span>
    </div>
  )
}