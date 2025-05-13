
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'applicant' | 'restaurant' | 'admin'>;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, userProfile, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push({
        pathname: redirectTo,
        query: { returnUrl: router.asPath },
      });
      return;
    }

    // If roles are specified and user doesn't have the required role, redirect
    if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.userType)) {
      // Redirect to the appropriate dashboard based on user type
      const dashboardPath = getDashboardPathForUserType(userProfile.userType);
      router.push(dashboardPath);
    }
  }, [isAuthenticated, isLoading, userProfile, router, allowedRoles, redirectTo]);

  // Helper function to get dashboard path based on user type
  const getDashboardPathForUserType = (userType: string): string => {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'restaurant':
        return '/restaurant/dashboard';
      case 'applicant':
        return '/applicant/dashboard';
      default:
        return '/';
    }
  };

  // Show nothing while loading or redirecting
  if (isLoading || !isAuthenticated || (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.userType))) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // If authenticated and authorized, render children
  return <>{children}</>;
}
