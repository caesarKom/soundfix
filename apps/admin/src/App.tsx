import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/query-client.ts';
import { useAuthStore } from './store/useAuthStore.ts';
import { LoginPage } from './components/login-page.tsx';
import { AdminLayout } from './components/admin-layout.tsx';

import { DashboardPage } from './features/dashboard/components/dashboard-page.tsx';
import { UsersPage } from './features/users/components/users-page.tsx';
import { MusicPage } from './features/music/components/music-page.tsx';
import { PlaylistsPage } from './features/playlists/components/playlists-page.tsx';

export function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentView, setCurrentView] = useState('dashboard');

  // Determine which main view module component should be rendered
  const renderMainContent = () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return <LoginPage />;
    }

    return (
      <AdminLayout currentView={currentView} onViewChange={setCurrentView}>
        {currentView === 'dashboard' && <DashboardPage />}
        {currentView === 'users' && <UsersPage />}
        {currentView === 'music' && <MusicPage />}
        {currentView === 'playlists' && <PlaylistsPage />}
      </AdminLayout>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      {renderMainContent()}
    </QueryClientProvider>
  );
}

export default App;
