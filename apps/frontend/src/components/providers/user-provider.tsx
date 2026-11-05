"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedUserProvider({children}:{children:React.ReactNode}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isLoading } = useAuth()

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.replace(`/`)
        }
    }, [user, isLoading, router, pathname])

    if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-spotify-black text-spotify-white">
        <div className="flex flex-col items-center gap-3">
          {/* spinner */}
          <div className="w-8 h-8 border-4 border-spotify-highlight border-t-spotify-green rounded-full animate-spin" />
          <p className="text-sm text-spotify-muted tracking-wide">Session verification in progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If the user is logged in, we return the protected page content.
  return <>{children}</>;
}