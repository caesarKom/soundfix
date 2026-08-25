"use client";

import Image from "next/image";
import { usePlayerStore } from "@/store/player.store";
import { ENV } from "@/config/env.config";
import { X, Music, User } from "lucide-react";
import { SyntheticEvent, useEffect, useRef } from "react";
import { authService } from "@/services/auth.service";

export function NowPlayingView() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { currentTrack, isRightPanelVisible, toggleRightPanel, isPlaying, volume, next, setProgress,setDuration } = usePlayerStore();
  
  
  const track = currentTrack();

  const isVideo = track?.mimeType?.toLowerCase().includes("video") || track?.mimeType?.toLowerCase().includes("mp4");

  useEffect(() => {
    if (!videoRef.current || !track || !isVideo) return;

    let cancelled = false;

    authService.getMediaToken().then((token) => {
      if (cancelled || !videoRef.current) return;
      
      videoRef.current.src = `${ENV.API_URL}/music/stream/${track.id}?token=${token}`;
      videoRef.current.load();
      
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [track?.id, isVideo]);

  // Synchronizacja przycisków Play / Pause dla wideo
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;

    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isVideo]);

  // Synchronizacja suwaka głośności dla wideo
  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.volume = volume;
    }
  }, [volume, isVideo]);

  if (!isRightPanelVisible || !track) return null;

  const handleTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    setProgress(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  return (
    <div className="w-85 bg-spotify-base rounded-lg p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full shrink-0 border-l border-spotify-press/30">
      {/* Head of panel */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-spotify-white">Now Playing</h3>
        <button 
          onClick={toggleRightPanel}
          className="text-spotify-muted hover:text-spotify-white transition cursor-pointer p-1 rounded-full hover:bg-spotify-highlight"
        >
          <X size={18} />
        </button>
      </div>


      <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-2xl bg-spotify-highlight">
        {isVideo ? 
     <video
            ref={videoRef}
            preload="none"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => next()}
            className="w-full h-full object-cover bg-black"
          />
         : 
            <Image
          src={ENV.getMediaUrl(track.coverUrl)}
          alt={track.title}
          fill
          sizes="308px"
          className="object-cover"
          loading="eager"
          unoptimized
        />
        
}
      </div>

      {/* Metadata */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-spotify-white hover:underline cursor-pointer truncate">
          {track.title}
        </h2>
        <p className="text-sm text-spotify-muted hover:text-spotify-white hover:underline cursor-pointer truncate mt-1">
          {track.artist}
        </p>
      </div>

      {/* Artist info */}
      <div className="bg-spotify-highlight rounded-lg overflow-hidden mt-2 border border-spotify-press/20">
        <div className="relative h-28 bg-linear-to-b from-spotify-muted/20 to-spotify-press p-4 flex items-end">
          <div className="flex items-center gap-2 z-10">
            <div className="w-10 h-10 rounded-full bg-spotify-base flex items-center justify-center text-spotify-muted border border-spotify-press">
              <User size={20} />
            </div>
            <span className="font-bold text-sm text-spotify-white truncate">{track.artist}</span>
          </div>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="p-4">
          <p className="text-xs text-spotify-muted line-clamp-3 leading-relaxed">
            Album: <span className="text-spotify-white font-medium">{track.album}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
