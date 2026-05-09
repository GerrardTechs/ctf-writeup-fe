import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, init } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}