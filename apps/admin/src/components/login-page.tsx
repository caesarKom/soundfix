import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.ts';
import { authApi } from '../features/auth/api/auth-api.ts';
import { loginSchema } from '../types/auth-feature.ts';
import { AxiosError } from 'axios';

export function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (authData) => {
      // Direct state mutation triggers instantaneous conditional rendering in App.tsx
      setAuth(authData.user, authData.accessToken);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Authentication failed';
        setFormError(Array.isArray(message) ? message.join(', ') : message);
      } else if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('An unexpected network error occurred');
      }
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const validation = loginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation error';
      setFormError(firstError);
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-800/80 space-y-6">
        
        {/* Decorative Top Branding Shield Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full mb-2 shadow-lg shadow-emerald-500/10">
            <Shield className="w-8 h-8 text-slate-950 font-black" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Secure Admin Panel
          </h1>
          <p className="text-slate-400 text-sm">
            Soundfix Spotify Clone Management
          </p>
        </div>
        
        {formError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input field field with leading mail icon box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="admin@soundfix.com"
              />
            </div>
          </div>

          {/* Password field with leading lock icon box and interactive toggle visibility switch */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submitting execution trigger action controller */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3 px-4 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.99] focus:outline-none"
          >
            {loginMutation.isPending ? 'Verifying access credentials...' : 'Enter Admin Panel'}
          </button>

        </form>
      </div>
    </div>
  );
}
