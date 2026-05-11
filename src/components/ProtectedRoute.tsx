import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: 'buyer' | 'seller';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-300">
          Seller account required
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
