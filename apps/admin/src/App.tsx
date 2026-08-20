import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from './api/query-client.ts';
import { ProtectedRoute } from './components/protected-route.tsx';
import { LoginPage } from './components/login-page.tsx';
import { AdminLayout } from './components/admin-layout.tsx';
import { DashboardPage } from './features/dashboard/components/dashboard-page.tsx';
import { UsersPage } from './features/users/components/users-page.tsx';
import { MusicPage } from './features/music/components/music-page.tsx';
import { PlaylistsPage } from './features/playlists/components/playlists-page.tsx';

export function App() {
 return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Secure Admin Dashboard Ecosystem */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="music" element={<MusicPage />} />
            <Route path="playlists" element={<PlaylistsPage />} />
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
