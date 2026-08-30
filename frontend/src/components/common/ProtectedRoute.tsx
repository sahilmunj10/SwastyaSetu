import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { HeartHandshake } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 p-6">
        <div className="w-14 h-14 bg-gov-navy rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
          <HeartHandshake className="w-8 h-8 text-amber-400" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-black text-gov-navy font-sans tracking-wide">SWASTHYA SETU</div>
          <p className="text-xs text-slate-500 font-medium">Verifying public health authentication session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    // Map user to their own role dashboard
    const roleDashboardMap: Record<string, string> = {
      PATIENT: '/patient',
      ASHA: '/asha',
      DOCTOR: '/doctor',
      LAB: '/diagnostics',
      PHARMACY: '/pharmacy',
      ADMIN: '/admin',
      DISTRICT_OFFICER: '/district'
    };

    const target = roleDashboardMap[user.role] || '/';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};
