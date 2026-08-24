"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import type { SubmitEvent } from "react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  
  const emailParam = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailParam) {
      router.push("/register");
    }
  }, [emailParam, router]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.verifyOtp({ email: emailParam, code });
      setAuth(data.accessToken, data.user);
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-spotify-black px-4">
      <div className="w-full max-w-md bg-spotify-base p-8 rounded-lg border border-spotify-press">
        <h1 className="text-2xl font-bold text-center mb-2 text-spotify-white">Verify your email</h1>
        <p className="text-xs text-spotify-muted text-center mb-8">
          We sent a 6-digit verification code to <span className="text-spotify-white font-medium">{emailParam}</span>
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600 text-red-200 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-spotify-muted mb-2 text-center">
              Enter 6-digit code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              className="w-full bg-spotify-highlight border border-spotify-muted/20 rounded p-4 text-center tracking-widest text-xl font-bold text-spotify-white focus:outline-none focus:border-spotify-green"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-spotify-green text-spotify-black font-bold p-3 rounded-full hover:scale-104 transition-all disabled:opacity-50 text-sm mt-4 cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify & Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
