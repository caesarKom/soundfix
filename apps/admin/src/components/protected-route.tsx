import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.ts';
import { authApi } from '../features/auth/api/auth-api.ts';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(!isAuthenticated);

  useEffect(() => {
    // If memory already holds valid session data, bypass network checks entirely
    if (isAuthenticated) {
      setIsChecking(false);
      return;
    }

    let isCurrentRequest = true;

    authApi
      .getMe()
      .then((userData) => {
        if (!isCurrentRequest) return;
        const token = useAuthStore.getState().accessToken;
        setAuth(userData, token);
      })
      .catch(() => {
        if (!isCurrentRequest) return;
        setAuth(null, null);
      })
      .finally(() => {
        if (isCurrentRequest) {
          setIsChecking(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isAuthenticated, setAuth]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
        <p className="text-emerald-400 font-bold tracking-wide animate-pulse text-sm">
          Verifying application session credentials...
        </p>
      </div>
    );
  }

  // Final check: if user failed verification or role is not ADMIN, bounce out
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
