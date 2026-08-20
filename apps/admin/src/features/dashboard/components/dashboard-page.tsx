import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard-api.ts';

export function DashboardPage() {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-emerald-400 font-medium animate-pulse">Loading system statistics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl text-red-400">
        <p className="font-bold">Failed to load statistics</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Registered Users', value: stats?.totalUsers ?? 0, icon: '👥', color: 'border-blue-500/20' },
    { title: 'Tracks in Library', value: stats?.totalTracks ?? 0, icon: '🎵', color: 'border-emerald-500/20' },
    { title: 'Global Playlists', value: stats?.totalPlaylists ?? 0, icon: '🗂️', color: 'border-purple-500/20' },
    { title: 'Total Streams Count', value: stats?.totalPlayCount ?? 0, icon: '📈', color: 'border-amber-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">System Metrics Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time overview of the Soundfix application data ecosystem.</p>
      </div>

      {/* Grid for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-6 bg-slate-900 border ${card.color} rounded-xl shadow-xl flex items-center justify-between`}>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <p className="text-3xl font-black text-white">{card.value.toLocaleString()}</p>
            </div>
            <span className="text-3xl bg-slate-950 p-3 rounded-lg border border-slate-800">{card.icon}</span>
          </div>
        ))}
      </div>

      {/* Most Popular Tracks Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Trending Soundfix Tracks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 pl-4">Track Title</th>
                <th className="pb-3">Artist / Creator</th>
                <th className="pb-3 pr-4 text-right">Streams count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {stats?.recentTracks && stats.recentTracks.length > 0 ? (
                stats.recentTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3.5 pl-4 font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {track.title}
                    </td>
                    <td className="py-3.5 text-slate-400">{track.artist}</td>
                    <td className="py-3.5 pr-4 text-right font-mono font-medium text-slate-300">
                      {track.playCount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No stream data collected yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
