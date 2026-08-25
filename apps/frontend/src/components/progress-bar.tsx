"use client";

import { useState, ChangeEvent } from "react";
import { usePlayerStore } from "@/store/player.store";

export function ProgressBar() {
  const { progress, duration, setProgress } = usePlayerStore();
  const [dragValue, setDragValue] = useState<number | null>(null);

  const displayValue = dragValue ?? progress;

  const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleCommit = (value: number) => {
    const audio = document.querySelector("audio");
    if (audio) {
      audio.currentTime = value;
    }
    setProgress(value);
    setDragValue(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDragValue(parseFloat(e.target.value));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    handleCommit(parseFloat(e.currentTarget.value));
  };

  return (
    <div className="flex items-center gap-2 w-full text-xs text-spotify-muted select-none">
      <span className="tabular-nums w-8 text-right">
        {formatTime(displayValue)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={displayValue}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        className="flex-1 h-1 bg-spotify-press rounded-lg appearance-none cursor-pointer accent-spotify-white hover:accent-spotify-green"
      />
      <span className="tabular-nums w-8 text-left">
        {formatTime(duration)}
      </span>
    </div>
  );
}
