"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function RootPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-spotify-black text-spotify-muted text-sm">
      Loading Soundfix...
    </div>
  );
}