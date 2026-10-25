"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { ArrowRight, Download, Music, Shield, Smartphone, Zap } from "lucide-react";
import { useAuthModal } from "@/hooks/useAuthModal";
import { Modal } from "@/components/modal";

const HandleDownloadAndroid = () => {
    return (
      <a 
            href="/downloads/soundfix.apk"
            download="soundfix.apk"
            className="flex items-center gap-2 w-full sm:w-auto justify-center bg-spotify-highlight border border-spotify-press text-spotify-white font-semibold px-8 py-4 rounded-full hover:bg-spotify-press hover:border-spotify-muted/30 transition cursor-pointer text-base backdrop-blur-md"
          >
            <Download size={18} className="text-spotify-green" />
            Download for Android (.APK)
          </a>
    )
  };

export default function RootPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { onClose, isOpen, onOpenLogin, onOpenRegister, type } = useAuthModal()

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
            onClick={() => onOpenLogin()}
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

       {/* HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-spotify-highlight border border-spotify-press text-xs font-medium text-spotify-green mb-6 backdrop-blur-md">
          <Zap size={12} fill="#1db954" /> A New Era of music streaming
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Your music. <br />
          <span className="bg-linear-to-r from-spotify-green to-brand bg-clip-text text-transparent">
            Fixed forever.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-spotify-muted max-w-2xl mb-10 leading-relaxed">
          Listen to your favorite playlists, create your own collections, and enjoy crystal-clear sound without limits. Just the way you like it.
        </p>

        {/* Buttons (CTA) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="group flex items-center gap-2 w-full sm:w-auto justify-center bg-spotify-green text-spotify-black font-bold px-8 py-4 rounded-full shadow-lg shadow-spotify-green/20 hover:bg-brand hover:scale-104 active:scale-98 transition cursor-pointer text-base"
          >
            Start listening
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <HandleDownloadAndroid />
        </div>

          {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 mt-24 w-full border-t border-spotify-highlight pt-10 text-left">
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-spotify-highlight rounded-lg text-spotify-green border border-spotify-press">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-spotify-white">Completely free</h3>
              <p className="text-xs text-spotify-muted mt-1">No hidden subscriptions or unexpected fees.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-spotify-highlight rounded-lg text-spotify-green border border-spotify-press">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-spotify-white">Mobile Application</h3>
              <p className="text-xs text-spotify-muted mt-1">Take Soundfix with you on your Android phone.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-spotify-highlight rounded-lg text-spotify-green border border-spotify-press">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-spotify-white">Instant action</h3>
              <p className="text-xs text-spotify-muted mt-1">A lightweight interface that doesn&apos;t burden your device.</p>
            </div>
          </div>
        </div>
      </main>

      {isOpen && type === "login" && (
        <Modal title={"Welcome Back"} onClose={onClose} isOpen={isOpen}>
<div>
  <h1>Testa</h1>
</div>
        </Modal>
      )}

      </div>
  )
}