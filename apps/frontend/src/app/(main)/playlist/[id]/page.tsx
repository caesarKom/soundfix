"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { musicService, PlaylistData, MusicTrack } from "@/services/music.service";
import { usePlayerStore } from "@/store/player.store";
import { ENV } from "@/config/env.config";
import { Play, Pause, Clock } from "lucide-react";

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  // Unwrap dynamic route parameters according to React 19 / Next.js standards
  const { id } = use(params);

  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const { setTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    musicService.getPlaylistById(id)
      .then(setPlaylist)
      .catch((err) => console.error("Failed to load playlist detailed view", err));
  }, [id]);

  if (!playlist) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-spotify-muted">
        Loading playlist details...
      </div>
    );
  }

  const songs = playlist.songs || [];

  const handleRowClick = (track: MusicTrack, index: number) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      const formattedQueue = songs.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: t.duration,
        coverUrl: t.coverUrl,
        audioUrl: t.audioUrl
      }));
      
      setTrack(formattedQueue[index], formattedQueue, index);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-full bg-linear-to-b from-spotify-highlight to-spotify-base">
      {/* Header section with cover and titles */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-6 pt-16 bg-linear-to-b from-spotify-white/10 to-transparent">
        <div className="relative w-48 h-48 md:w-60 md:h-60 shadow-2xl rounded overflow-hidden shrink-0">
          <Image
            src={ENV.getMediaUrl(playlist.coverUrl)}
            alt={playlist.name}
            fill
            sizes="(max-width: 768px) 192px, 240px"
            className="object-cover"
            loading="eager"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-spotify-white">
            Playlist
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-spotify-white tracking-tight">
            {playlist.name}
          </h1>
          <p className="text-sm text-spotify-muted mt-2">
            {playlist.description || "No description provided."}
          </p>
          <p className="text-xs text-spotify-white font-medium mt-1">
            Soundfix • <span className="text-spotify-muted">{songs.length} songs</span>
          </p>
        </div>
      </div>

      {/* Action controls panel */}
      <div className="p-6">
        {songs.length > 0 && (
          <button
            onClick={() => handleRowClick(songs[0], 0)}
            className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center shadow-xl hover:scale-105 transition cursor-pointer mb-6"
          >
            {isPlaying && songs.some(s => s.id === currentTrack?.id) ? (
              <Pause size={24} fill="black" className="text-spotify-black" />
            ) : (
              <Play size={24} fill="black" className="ml-1 text-spotify-black" />
            )}
          </button>
        )}

        {/* Tracks standard Spotify grid table */}
        {songs.length === 0 ? (
          <div className="text-sm text-spotify-muted py-10 text-center">
            This playlist is empty. Add some tracks via Admin Panel or database.
          </div>
        ) : (
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-spotify-press text-xs font-bold tracking-wider uppercase text-spotify-muted">
                <th className="py-2 w-12 text-center">#</th>
                <th className="py-2">Title</th>
                <th className="py-2 hidden md:table-cell">Album</th>
                <th className="py-2 w-16 text-center">
                  <Clock size={16} />
                </th>
              </tr>
            </thead>
            <tbody>
              {songs.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <tr
                    key={track.id}
                    onClick={() => handleRowClick(track, index)}
                    className="group hover:bg-spotify-white/10 rounded transition duration-200 cursor-pointer text-sm text-spotify-muted hover:text-spotify-white"
                  >
                    <td className="py-3 text-center font-medium w-12">
                      {isCurrent && isPlaying ? (
                        <span className="text-spotify-green text-xs animate-pulse">▶</span>
                      ) : (
                        <span className={isCurrent ? "text-spotify-green" : ""}>{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                        <Image
                          src={ENV.getMediaUrl(track.coverUrl)}
                          alt={track.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="overflow-hidden pr-4">
                        <p className={`font-medium truncate ${isCurrent ? "text-spotify-green" : "text-spotify-white"}`}>
                          {track.title}
                        </p>
                        <p className="text-xs truncate group-hover:text-spotify-white transition">
                          {track.artist}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell truncate max-w-50">
                      {track.album}
                    </td>
                    <td className="py-3 text-center w-16 text-xs font-medium">
                      {formatDuration(track.duration)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
