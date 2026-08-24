"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import type { SubmitEvent } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.register({ email, password, name });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-spotify-black px-4">
      <div className="w-full max-w-md bg-spotify-base p-8 rounded-lg border border-spotify-press">
        <h1 className="text-3xl font-bold text-center mb-8 text-spotify-white">Sign up</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600 text-red-200 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-spotify-muted mb-2">
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-spotify-highlight border border-spotify-muted/20 rounded p-3 text-spotify-white focus:outline-none focus:border-spotify-green text-sm"
              placeholder="Enter a profile name."
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-spotify-muted mb-2">
              What&apos;s your email?
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
              Create a password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-spotify-highlight border border-spotify-muted/20 rounded p-3 text-spotify-white focus:outline-none focus:border-spotify-green text-sm"
              placeholder="Create a password."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green text-spotify-black font-bold p-3 rounded-full hover:scale-104 transition-all disabled:opacity-50 text-sm mt-4 cursor-pointer"
          >
            {loading ? "Creating account..." : "Next"}
          </button>
        </form>

        <div className="border-t border-spotify-press mt-6 pt-6 text-center text-sm text-spotify-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-spotify-white underline hover:text-spotify-green">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
