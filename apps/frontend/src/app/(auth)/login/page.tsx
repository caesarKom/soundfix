"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import Link from "next/link";

import type { SubmitEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser, user} = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      setToken(data.accessToken);
      const userData = await authService.getUserProfile();
      setUser(userData);
    
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-spotify-black px-4">
      <div className="w-full max-w-md bg-spotify-base p-8 rounded-lg border border-spotify-press">
        <h1 className="text-3xl font-bold text-center mb-8 text-spotify-white">Soundfix</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600 text-red-200 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-spotify-muted mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-spotify-highlight border border-spotify-muted/20 rounded p-3 text-spotify-white focus:outline-none focus:border-spotify-green text-sm"
              placeholder="name@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-spotify-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-spotify-highlight border border-spotify-muted/20 rounded p-3 text-spotify-white focus:outline-none focus:border-spotify-green text-sm"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green text-spotify-black font-bold p-3 rounded-full hover:scale-104 transition-all disabled:opacity-50 text-sm mt-4 cursor-pointer"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="border-t border-spotify-press mt-6 pt-6 text-center text-sm text-spotify-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-spotify-white underline hover:text-spotify-green">
            Sign up for Soundfix
          </Link>
        </div>
      </div>
    </div>
  );
}
