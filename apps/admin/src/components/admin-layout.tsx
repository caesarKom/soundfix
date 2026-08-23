import { type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore.ts';
import { authApi } from '../features/auth/api/auth-api.ts';
import { Avatar } from './avatar.tsx';

interface AdminLayoutProps {
  currentView: string;
  onViewChange: (view: string) => void;
  children: ReactNode;
}

export function AdminLayout({ currentView, onViewChange, children }: AdminLayoutProps) {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();
  const IMAGE_URL = import.meta.env.VITE_BACKEND_URL;

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      setAuth(null, null);
    },
    onError: () => {
      queryClient.clear();
      setAuth(null, null);
    },
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'music', label: 'Music Manager', icon: '🎵' },
    { id: 'playlists', label: 'Playlists', icon: '🗂️' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-black tracking-tight text-emerald-400">Soundfix</h1>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Admin Console</p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  currentView === item.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Avatar name={user?.name || "?"} imgUrl={user?.profile?.avatar ? `${IMAGE_URL}/${user?.profile?.avatar}` : null} size={32} />
            <div className="truncate">
              <p className="text-sm font-bold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full text-center py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 rounded-lg transition-colors"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Log Out Session'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
