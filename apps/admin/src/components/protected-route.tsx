import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.ts';
import { authApi } from '../features/auth/api/auth-api.ts';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const location = useLocation();
  
  // Directly initialize state based on authentication to avoid sync effect triggers
  const [isRestoring, setIsRestoring] = useState(() => !isAuthenticated && location.pathname !== '/login');

  useEffect(() => {
    // If already authenticated or on login screen, do not run restoration logic
    if (isAuthenticated || location.pathname === '/login') {
      return;
    }

    authApi
      .getMe()
      .then((userData) => {
        const token = useAuthStore.getState().accessToken;
        setAuth(userData, token);
      })
      .catch(() => {
        setAuth(null, null);
      })
      .finally(() => {
        setIsRestoring(false);
      });
  }, [isAuthenticated, setAuth, location.pathname]);

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <p className="text-emerald-400 font-medium animate-pulse">Restoring secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
