"use client";

import { useEffect, useRef, SyntheticEvent } from "react";
import { usePlayerStore } from "@/store/player.store";
import { authService } from "@/services/auth.service";
import { ENV } from "@/config/env.config";

type MediaElement = HTMLAudioElement | HTMLVideoElement;

export function MediaEngine() {
  const mediaRef = useRef<MediaElement | null>(null);
  const { isPlaying, volume, setProgress, setDuration, next, currentTrack } = usePlayerStore();

  const track = currentTrack();

  const setMediaRef = (el: MediaElement | null) => {
    mediaRef.current = el;
  };

  useEffect(() => {
    if (!mediaRef.current || !track) return;

    let cancelled = false;

    authService.getMediaToken().then((token) => {
      if (cancelled || !mediaRef.current) return;
      
      mediaRef.current.src = `${ENV.API_URL}/music/stream/${track.id}?token=${token}`;
      mediaRef.current.load();
      
      if (isPlaying) {
        mediaRef.current.play().catch(() => {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [track?.id]);

  useEffect(() => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.play().catch(() => {});
    } else {
      mediaRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = volume;
    }
  }, [volume]);

  if (!track) return null;

  const handleTimeUpdate = (e: SyntheticEvent<MediaElement>) => {
    setProgress(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: SyntheticEvent<MediaElement>) => {
    setDuration(e.currentTarget.duration);
  };

  return (
    <audio
      ref={setMediaRef}
      preload="none"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={() => next()}
      className="hidden"
    />
  );
}
