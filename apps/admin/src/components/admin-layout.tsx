import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore.ts';
import { authApi } from '../features/auth/api/auth-api.ts';

export function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Access global QueryClient instance
  const { user, setAuth } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      // Elegant pre-emptive wipe: clear all background queries immediately
      // before the server destruction starts to block stale refetches.
      queryClient.clear();
    },
    onSuccess: () => {
      setAuth(null, null);
      navigate('/login', { replace: true });
    },
    onError: () => {
      // Fallback clean-up if server fails
      queryClient.clear();
      setAuth(null, null);
      navigate('/login', { replace: true });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/music', label: 'Music Manager', icon: '🎵' },
    { path: '/playlists', label: 'Playlists', icon: '🗂️' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Layout */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-black tracking-tight text-emerald-400">
              Soundfix
            </h1>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">
              Admin Console
            </p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="truncate">
              <p className="text-sm font-bold text-slate-200 truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full text-center py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 hover:border-red-900/50 rounded-lg transition-colors disabled:opacity-50"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Log Out Session'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
