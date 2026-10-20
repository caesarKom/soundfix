"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Music } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-spotify-black text-spotify-muted text-sm">
        Loading Soundfix...
      </div>
    );
  }

  const handleDownloadAndroid = () => {
    window.location.href = "/downloads/soundfix.apk";
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans bg-spotify-black text-spotify-white select-none">
      <div className="living-bg" />
      <div className="hero-glow" />
      
      <div className="embers">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

       <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-spotify-white">
          <div className="p-2 bg-spotify-green rounded-xl text-spotify-black">
            <Music size={20} fill="black" />
          </div>
          <span>Sound<span className="text-spotify-green">fix</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {}}
            className="text-sm font-semibold text-spotify-muted hover:text-spotify-white transition cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => {}}
            className="text-sm font-semibold bg-spotify-white text-spotify-black px-5 py-2.5 rounded-full hover:scale-104 active:scale-98 transition cursor-pointer"
          >
            Register
          </button>
        </div>
      </header>

      </div>
  )
}