import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'staff' | 'customer')[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true
}) => {
  const { role, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check authentication if required
  if (requireAuth && !role) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;