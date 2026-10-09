"use client"

import Link from "next/link"
import Image from "next/image"
import { Home, Search, Library, LogOut, Plus, FolderHeart, Play, Globe2, Music, Upload, Trash2 } from "lucide-react"
import { musicService } from "@/services/music.service"
import { ENV } from "@/config/env.config"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { authService } from "@/services/auth.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Modal } from "./modal"
import { usePlayerStore } from "@/store/player.store"
import { useMemo, useRef, useState } from "react"

export function Sidebar() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { clearAuth, user } = useAuthStore()
  const { setTrack } = usePlayerStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: playlists = [] } = useQuery({
    queryKey: ["userPlaylists"],
    queryFn: musicService.getUserPlaylists,
  })

  const { data: allAvailableSongs = [] } = useQuery({
    queryKey: ["allSystemSongs"],
    queryFn: () => musicService.getPublicTracks({ page: 1, limit: 100 }),
    enabled: isModalOpen && !!editingPlaylist,
  })

   const myPlaylists = useMemo(() => playlists.filter((p: any) => p.userId === user?.id), [playlists, user])
  const publicPlaylists = useMemo(() => playlists.filter((p: any) => !p.isPrivate && p.userId !== user?.id), [playlists, user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const openCreateModal = () => {
    setEditingPlaylist(null)
    setName(`My Playlist #${playlists.length + 1}`)
    setDescription("")
    setIsPrivate(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  const openEditModal = (playlist: any, e: React.MouseEvent) => {
    e.preventDefault()
    setEditingPlaylist(playlist)
    setName(playlist.name)
    setDescription(playlist.description || "")
    setIsPrivate(playlist.isPrivate)
    setSelectedFile(null)
    setPreviewUrl(playlist.coverUrl ? ENV.getMediaUrl(playlist.coverUrl) : null)
    setIsModalOpen(true)
  }

 
  const savePlaylistMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("isPrivate", String(isPrivate))
      if (selectedFile) formData.append("cover", selectedFile)

      return editingPlaylist 
        ? musicService.updatePlaylist(editingPlaylist.id, formData)
        : musicService.createPlaylist(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] })
      setIsModalOpen(false)
    },
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: (id: string) => musicService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPlaylists"] })
      setIsModalOpen(false)
    }
  })

  const addSongMutation = useMutation({
    mutationFn: ({playlistId, musicId}: {playlistId: string, musicId: string }) => musicService.addSongToPlaylist(playlistId, musicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userPlaylists"] })
  })

  const removeSongMutation = useMutation({
    mutationFn: ({ playlistId, musicId }: { playlistId: string, musicId: string }) => musicService.removeSongFromPlaylist(playlistId, musicId ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userPlaylists"] })
  })

  const playWholePlaylist = async (playlistId: string, e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const songs = await musicService.getPlaylistSongs(playlistId)
      if (songs && songs.length > 0) {
        const queue = songs.map((t: any) => ({
          id: t.id, title: t.title, artist: t.artist, album: t.album,
          duration: t.duration, coverUrl: t.coverUrl, audioUrl: t.audioUrl, mimeType: t.mimeType,
        }))
        setTrack(queue, queue, 0)
      }
    } catch (err) { console.error(err) }
  }

  const handleLogoutClick = async () => {
    try { await authService.logout() } catch {} finally {
      clearAuth(); router.push("/login")
    }
  }

  const modalFooter = (
    <>
      {editingPlaylist ? (
        <button 
          onClick={() => confirm("Usuń tę playlistę?") && deletePlaylistMutation.mutate(editingPlaylist.id)}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 underline cursor-pointer bg-transparent border-none"
        >
          <Trash2 size={14} /> Usuń playlistę
        </button>
      ) : <div />}
      <div className="flex gap-3">
        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold hover:underline cursor-pointer">Anuluj</button>
        <button onClick={() => savePlaylistMutation.mutate()} disabled={savePlaylistMutation.isPending} className="px-6 py-2 text-sm font-bold bg-spotify-green text-spotify-black rounded-full hover:scale-105 transition disabled:opacity-50 cursor-pointer">
          {savePlaylistMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </>
  )

  return (
     <div className="flex flex-col gap-2 h-full select-none text-spotify-white">
        {/* Main */}
      <div className="bg-spotify-base rounded-lg p-5 space-y-4 flex flex-col items-center md:items-start">
        <Link href="/home" className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition w-full justify-center md:justify-start">
          <Home size={24} /><span className="hidden md:inline">Home</span>
        </Link>
        <Link href="/search" className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-spotify-white transition w-full justify-center md:justify-start">
          <Search size={24} /><span className="hidden md:inline">Search</span>
        </Link>
      </div>

      {/* Biblioteka z podziałem i ilością piosenek */}
      <div className="flex-1 bg-spotify-base rounded-lg p-5 flex flex-col overflow-hidden items-center md:items-start">
        <div className="flex items-center gap-3 text-spotify-muted mb-4 w-full justify-center md:justify-start">
          <Library size={24} /><span className="text-sm font-bold hidden md:inline">Your Library</span>
          <button onClick={openCreateModal} className="hidden md:flex items-center justify-center p-1 rounded-full text-spotify-muted hover:text-spotify-white hover:bg-spotify-highlight transition cursor-pointer ml-auto"><Plus size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none w-full">
          {/* Your playlists */}
          <div>
            <div className="items-center gap-1.5 px-2 mb-2 text-xs font-bold uppercase tracking-wider text-spotify-muted hidden md:flex"><FolderHeart size={12} /><span>My Playlists ({myPlaylists.length})</span></div>
            <div className="space-y-1">
              {myPlaylists.map((p) => (
                <Link key={p.id} href={`/playlist/${p.id}`} className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-highlight transition group justify-center md:justify-start relative">
                  <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-spotify-highlight">
                    <Image src={ENV.getMediaUrl(p.coverUrl)} alt="" fill sizes="48px" className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-spotify-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => playWholePlaylist(p.id, e)} className="p-1.5 bg-spotify-green rounded-full text-spotify-black transform scale-90 hover:scale-100 transition"><Play size={14} fill="black" /></button>
                    </div>
                  </div>
                  <div className="overflow-hidden hidden md:block flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-spotify-white truncate group-hover:text-spotify-green transition">{p.name}</p>
                      <button onClick={(e) => openEditModal(p, e)} className="text-xs text-spotify-muted hover:text-spotify-white underline opacity-0 group-hover:opacity-100 transition">Edit</button>
                    </div>
                    <p className="text-xs text-spotify-muted truncate mt-0.5">Playlist • {p._count?.songs ?? 0} tracks</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

           {/* Public playlists */}
          {publicPlaylists.length > 0 && (
            <div>
              <div className="items-center gap-1.5 px-2 mb-2 text-xs font-bold uppercase tracking-wider text-spotify-muted hidden md:flex mt-2">
                <Globe2 size={12} />
                <span>Public Playlists ({publicPlaylists.length})</span>
              </div>
              <div className="space-y-1">
                {publicPlaylists.map((p) => (
                  <Link 
                    key={p.id} 
                    href={`/playlist/${p.id}`} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-highlight transition group justify-center md:justify-start"
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-spotify-highlight">
                      <div className="absolute inset-0 bg-spotify-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => playWholePlaylist(p.id, e)} 
                          className="p-1.5 bg-spotify-green rounded-full text-spotify-black cursor-pointer"
                        >
                          <Play size={14} fill="black" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-hidden hidden md:block">
                      <p className="text-sm font-medium text-spotify-white truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-spotify-muted truncate">
                        By {p.owner?.name || "User"} • {p._count?.songs ?? 0} tracks
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

     {/* Footer profile */}
      <div className="bg-spotify-base rounded-lg p-4 flex flex-col gap-2 items-center md:items-start mt-auto">
        <div className="flex items-center gap-3 w-full justify-center md:justify-start px-2 py-1">
          {user?.profile.avatar ? (
            <div className="flex relative size-8 rounded-full items-center justify-center overflow-hidden">
              <Image
                src={ENV.getMediaUrl(user.profile.avatar)}
                alt={user.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-spotify-green flex items-center justify-center text-spotify-black font-bold text-xs shrink-0 select-none">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className="text-sm font-medium text-spotify-white truncate hidden md:inline">
            {user?.name || "Account"}
          </span>
        </div>
        <button 
          onClick={handleLogoutClick} 
          className="flex items-center gap-5 text-sm font-bold text-spotify-muted hover:text-red-500 transition w-full justify-center md:justify-start p-2 rounded hover:bg-spotify-highlight cursor-pointer"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Log Out</span>
        </button>
      </div>

      {/* PLAYLISTS FORM */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPlaylist ? `Zarządzaj: ${editingPlaylist.name}` : "Stwórz nową playlistę"}
        footerActions={modalFooter}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Zmiana okładki */}
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="relative w-40 h-40 bg-spotify-base border border-spotify-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden group shrink-0"
            >
              {previewUrl ? (
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
              ) : (
                <Upload size={32} className="text-spotify-muted group-hover:text-spotify-white transition" />
              )}
              <div className="absolute inset-0 bg-spotify-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold">
                Zmień okładkę
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Dane tekstowe */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-bold text-spotify-muted block mb-1">Nazwa playlisty</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-spotify-base border border-spotify-white/10 rounded p-2 text-sm focus:outline-none focus:border-spotify-green text-spotify-white" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-spotify-muted block mb-1">Opis (opcjonalnie)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={3} 
                  className="w-full bg-spotify-base border border-spotify-white/10 rounded p-2 text-sm focus:outline-none focus:border-spotify-green resize-none text-spotify-white" 
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input 
                  type="checkbox" 
                  id="privacy-check" 
                  checked={isPrivate} 
                  onChange={(e) => setIsPrivate(e.target.checked)} 
                  className="accent-spotify-green size-4" 
                />
                <label htmlFor="privacy-check" className="text-sm font-medium text-spotify-muted hover:text-spotify-white cursor-pointer select-none">
                  Ustaw jako prywatną
                </label>
              </div>
            </div>
          </div>

          {/* Managing tracks in a modal */}
          {editingPlaylist && (
            <div className="border-t border-spotify-white/5 pt-4 space-y-3">
              <h4 className="text-sm font-bold text-spotify-muted uppercase tracking-wider flex items-center gap-1.5">
                <Music size={14} />
                <span>Manage tracks</span>
              </h4>
              <div className="bg-spotify-base rounded-lg border border-spotify-white/5 p-2 max-h-52 overflow-y-auto scrollbar-none divide-y divide-spotify-white/5">
                {allAvailableSongs.map((song: any) => {
                  const isAlreadyInPlaylist = editingPlaylist.songs?.some((s: any) => s.id === song.id)
                  
                  return (
                    <div key={song.id} className="flex items-center justify-between p-2 text-xs">
                      <div className="flex items-center gap-3 overflow-hidden flex-1 pr-4">
                        <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 bg-spotify-highlight">
                          <Image
                            src={ENV.getMediaUrl(song.coverUrl)}
                            alt={song.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-spotify-white truncate">{song.title}</p>
                          <p className="text-spotify-muted truncate">{song.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => isAlreadyInPlaylist 
                          ? removeSongMutation.mutate({ playlistId: editingPlaylist.id, musicId: song.id })
                          : addSongMutation.mutate({ playlistId: editingPlaylist.id, musicId: song.id })
                        }
                        className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                          isAlreadyInPlaylist 
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" 
                            : "bg-spotify-white text-spotify-black hover:bg-spotify-green"
                        }`}
                      >
                        {isAlreadyInPlaylist ? "Delete" : "Add"}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}