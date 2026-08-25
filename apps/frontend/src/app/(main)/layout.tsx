"use client";

import { MediaEngine } from "@/components/media-engine";
import { PlayerBar } from "@/components/player-bar";
import { Sidebar } from "@/components/sidebar";
import type { ReactNode } from "react";


interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-spotify-black text-spotify-white select-none overflow-hidden">

    <MediaEngine />
    
    <div className="flex flex-1 p-2 gap-2 h-[calc(100vh-90px)] overflow-hidden">
      <aside className="w-20 md:w-[320px] flex flex-col gap-2 shrink-0 transition-all duration-300">
        <Sidebar />
      </aside>
      <main className="flex-1 bg-spotify-base rounded-lg overflow-y-auto relative custom-scrollbar">
        {children}
      </main>
    </div>
    <footer className="h-22.5 bg-spotify-black px-4 flex items-center">
      <PlayerBar />
    </footer>
  </div>
  );
}
