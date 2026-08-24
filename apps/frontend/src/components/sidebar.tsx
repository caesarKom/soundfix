"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Search, Library } from "lucide-react";
import { musicService, PlaylistData } from "@/services/music.service";
import Image from "next/image";
import { ENV } from "@/config/env.config";

export function Sidebar() {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);

  useEffect(() => {
    musicService.getUserPlaylists()
      .then(setPlaylists)
      .catch((err) => console.error("Failed to load playlists", err));
  }, []);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-spotify-base rounded-lg p-5 space-y-4">
        <Link
          href="/home"
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition"
        >
          <Home size={24} />
          Home
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition"
        >
          <Search size={24} />
          Search
        </Link>
      </div>

      <div className="flex-1 bg-spotify-base rounded-lg p-5 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 text-spotify-muted mb-4">
          <Library size={24} />
          <span className="text-sm font-bold">Your Library</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {playlists.length === 0 ? (
            <div className="text-xs text-spotify-muted px-2 py-4">
              No playlists created yet.
            </div>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-highlight transition group"
              >
                <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                <Image
    src={ENV.getMediaUrl(playlist.coverUrl)}
    alt={playlist.name}
    fill
    sizes="48px"
    className="object-cover"
    unoptimized // disable optimization for dynamic local development files
  />
  </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-spotify-white truncate group-hover:text-spotify-green transition">
                    {playlist.name}
                  </p>
                  <p className="text-xs text-spotify-muted truncate">
                    Playlist
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
