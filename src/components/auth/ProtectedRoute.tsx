import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes: Array<'applicant' | 'restaurant' | 'admin'>;
  redirectPath?: string; // Make redirectPath optional
}

export default function ProtectedRoute({
  children,
  allowedUserTypes,
  redirectPath = '/auth/login',
}: ProtectedRouteProps) {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectPath); // Default redirect if not provided
      return;
    }

    if (!isLoading && isAuthenticated && userProfile) {
      // Ensure userProfile.userType is defined before using it
      const currentUserType = userProfile.userType;
      if (currentUserType && !allowedUserTypes.includes(currentUserType)) {
        // User is authenticated but not of the allowed type
        // Redirect to a generic unauthorized page or their specific dashboard
        let unauthorizedRedirect = "/"; // Default fallback
        if (currentUserType === "admin") unauthorizedRedirect = "/admin/dashboard";
        else if (currentUserType === "restaurant") unauthorizedRedirect = "/restaurant/dashboard";
        else if (currentUserType === "applicant") unauthorizedRedirect = "/applicant/dashboard";
        
        router.push(redirectPath || unauthorizedRedirect);
      }
    }
  }, [user, userProfile, isAuthenticated, isLoading, allowedUserTypes, router, redirectPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Ensure userProfile and userProfile.userType are defined before checking allowedUserTypes
  if (isAuthenticated && userProfile && userProfile.userType && allowedUserTypes.includes(userProfile.userType)) {
    return <>{children}</>;
  }
  
  // Fallback for scenarios where user is authenticated but profile might still be loading or type doesn't match
  // This often gets handled by the useEffect redirect, but as a safety net:
  if (isAuthenticated && !isLoading && userProfile && userProfile.userType && !allowedUserTypes.includes(userProfile.userType)) {
    // This state should ideally be caught by the useEffect redirect.
    // Showing a loading or "redirecting" state can be smoother.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting...</p>
        </div>
    );
  }

  // If not authenticated and not loading, null will be returned, and useEffect handles redirect.
  // Or, you can show a "Redirecting to login..." message here too.
  return null;
}