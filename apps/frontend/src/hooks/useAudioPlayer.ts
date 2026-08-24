import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/player.store";
import { ENV } from "@/config/env.config";
import { authService } from "@/services/auth.service";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentTrack, isPlaying, volume, setPlaying, nextTrack } = usePlayerStore();

  // Audio Instance Initialization
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [nextTrack]);

  // Reaction to song change and connecting a secure stream with a token
  useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !currentTrack) return;

  let isMounted = true;
 
    authService.getMediaToken()
        .then((token) => {
        if (!isMounted) return;
        
        // build a secure stream URL with a valid token from the backend
        audio.src = `${ENV.API_URL}/music/stream/${currentTrack.id}?token=${token}`;
        audio.load();

        if (isPlaying) {
          audio.play().catch(() => setPlaying(false));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch secure media token", err);
        setPlaying(false);
      });


  return () => {
    isMounted = false;
  };
}, [currentTrack, isPlaying, setPlaying]);
  // Reaction to volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return audioRef;
}
