"use client";

import { usePlayerStore } from "@/store/player.store";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import { ENV } from "@/config/env.config";

export function PlayerBar() {
  // Activate audio player hook to sync state with the native HTML5 Audio instance
  useAudioPlayer();

  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, volume, setVolume } = usePlayerStore();

  if (!currentTrack) {
    return (
      <div className="w-full text-center text-xs text-spotify-muted">
        Select a track to start playing
      </div>
    );
  }

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="w-full grid grid-cols-3 items-center">
      {/* Left section: Track details */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded overflow-hidden shrink-0">
  <Image
    src={ENV.getMediaUrl(currentTrack.coverUrl)}
    alt={currentTrack.title}
    fill
    sizes="56px"
    className="object-cover"
    unoptimized
  />
</div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-medium text-spotify-white truncate">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-spotify-muted truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Middle section: Player playback controls */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button
            onClick={prevTrack}
            className="text-spotify-muted hover:text-spotify-white transition cursor-pointer"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-spotify-white text-spotify-black flex items-center justify-center hover:scale-105 transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause size={18} fill="black" />
            ) : (
              <Play size={18} fill="black" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="text-spotify-muted hover:text-spotify-white transition cursor-pointer"
          >
            <SkipForward size={20} />
          </button>
        </div>
        {/* Simple playback progress bar */}
        <div className="w-full max-w-md h-1 bg-spotify-press rounded-full overflow-hidden">
          <div className="h-full bg-spotify-white w-0 hover:bg-spotify-green transition-all" />
        </div>
      </div>

      {/* Right section: Volume controls */}
      <div className="flex items-center justify-end gap-2 text-spotify-muted">
        <Volume2 size={18} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-spotify-press rounded-lg appearance-none cursor-pointer accent-spotify-white hover:accent-spotify-green"
        />
      </div>
    </div>
  );
}
