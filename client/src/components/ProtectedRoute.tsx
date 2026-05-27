import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return <Navigate to="/login" replace state={{ from: location }} />;
};

export const PublicOnlyRoute = ({ children }: ProtectedRouteProps) => {
  const { status } = useAuth();
  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
