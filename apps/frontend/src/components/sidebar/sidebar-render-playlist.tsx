import { ENV } from "@/config/env.config"
import { PlaylistData } from "@/services/music.service"
import { Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Props {
  p: PlaylistData
  type: "OWNER" | "PUBLIC" | "PRIVATE"
  playPlaylist: (id: string, e: React.MouseEvent) => void
  openEditModal?: (p: PlaylistData, e: React.MouseEvent) => void
}

function SidebarRenderPlaylists({
  p,
  type,
  openEditModal,
  playPlaylist,
}: Props) {
  return (
    <Link
      href={`/playlist/${p.id}`}
      className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-highlight transition group justify-center md:justify-start relative"
    >
      <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-spotify-highlight">
        <Image
          src={ENV.getMediaUrl(p.coverUrl)}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-spotify-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => playPlaylist(p.id, e)}
            className="p-1.5 bg-spotify-green rounded-full text-spotify-black transform scale-90 hover:scale-100 transition"
          >
            <Play size={14} fill="black" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden hidden md:block flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-spotify-white truncate group-hover:text-spotify-green transition">
            {p.name}
          </p>
          {type === "OWNER" && (
            <button
              onClick={(e) => openEditModal?.(p, e)}
              className="text-xs text-spotify-muted hover:text-spotify-white opacity-0 group-hover:opacity-100 transition"
            >
              Edit
            </button>
          )}
        </div>
        <p className="text-xs text-spotify-muted truncate mt-0.5">
          {type === "PUBLIC" ? `By ${p.owner?.name} ` : `Playlist • `}
          {p._count?.songs ?? 0} tracks
        </p>
      </div>
    </Link>
  )
}

export default SidebarRenderPlaylists
