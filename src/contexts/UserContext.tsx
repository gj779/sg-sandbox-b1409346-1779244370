import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth, UserProfile } from '@/hooks/useFirebaseAuth';
import { User } from 'firebase/auth';
import { usePresence } from '@/hooks/usePresence';

// Define the shape of the context
interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{
    userProfile: UserProfile;
    dashboardPath: string;
  }>;
  loginWithGoogle: (userType: 'applicant' | 'restaurant') => Promise<{
    userProfile: UserProfile;
    dashboardPath: string;
    isNewUser: boolean;
  }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, userType: "applicant" | "restaurant") => Promise<{
    user: User;
    userProfile: UserProfile;
  }>;
  signUp: (userData: {
    email: string;
    password: string;
    userType: 'applicant' | 'restaurant';
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<{
    user: User;
    userProfile: UserProfile;
  }>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshUserProfile: () => Promise<UserProfile | null>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    userProfile,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signInWithGoogle,
    signOut,
    signUp,
    updateUserProfile,
    refreshUserProfile,
  } = useFirebaseAuth();

  const router = useRouter();
  const presence = usePresence();

  // Initialize presence tracking when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !presence.isInitialized) {
      presence.initializePresence();
    }
  }, [isAuthenticated, user, presence]);

  // Handle error logging
  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  // Handle user authentication state changes
  useEffect(() => {
    // If we're still loading, don't do anything yet
    if (isLoading) return;
    
    // If the user is authenticated and we have a profile
    if (isAuthenticated && userProfile) {
      // Check if we need to redirect based on user type
      const currentPath = window.location.pathname;
      
      // Only redirect if we're on the home page or a generic auth page
      // and not already on a user-specific page
      const shouldRedirect = 
        (currentPath === '/' || 
         currentPath === '/auth/login' ||
         currentPath === '/auth/register') &&
        !currentPath.includes(`/${userProfile.userType}`);
      
      if (shouldRedirect) {
        const dashboardPath = getDashboardPathForUserType(userProfile.userType);
        console.log(`Redirecting to dashboard: ${dashboardPath}`);
        router.push(dashboardPath);
      }
    }
  }, [isAuthenticated, isLoading, userProfile, router]);
  
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

  // Google login function
  const loginWithGoogle = async (userType: 'applicant' | 'restaurant' = 'applicant') => {
    try {
      console.log(`Attempting to login with Google as ${userType}`);
      const result = await signInWithGoogle(userType);
      console.log('Google login successful');
      return {
        userProfile: result.userProfile,
        dashboardPath: result.dashboardPath,
        isNewUser: result.isNewUser
      };
    } catch (error: any) {
      console.error('Google login error in context:', error);
      
      // Ensure we're returning a clean error message
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message).replace(/@/g, ' at ');
      }
      
      console.error('Google login error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Improved login function with better error handling
  const login = async (email: string, password: string) => {
    try {
      console.log(`Attempting to login with email: ${email}`);
      const result = await signIn(email, password);
      console.log('Login successful');
      return result;
    } catch (error: any) {
      console.error('Login error in context:', error);
      
      // Ensure we're returning a clean error message
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = String(error.message).replace(/@/g, ' at ');
        } else if ('code' in error) {
          // Handle Firebase error codes
          switch (String(error.code)) {
            case 'auth/invalid-credential':
            case 'auth/invalid-login-credentials':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              errorMessage = 'Invalid email or password. Please check your credentials and try again.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Invalid email format. Please enter a valid email address.';
              break;
            case 'auth/user-disabled':
              errorMessage = 'This account has been disabled. Please contact support.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your internet connection and try again.';
              break;
          }
        }
      }
      
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register function for the registration page
  const register = async (name: string, email: string, password: string, userType: "applicant" | "restaurant") => {
    try {
      // Split name into first and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const userData = {
        email,
        password,
        userType,
        firstName,
        lastName
      };
      
      const result = await signUp(userData);
      
      // Redirect to the appropriate dashboard
      const dashboardPath = userType === 'applicant' ? '/applicant/dashboard' : '/restaurant/dashboard';
      router.push(dashboardPath);
      
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function with redirect
  const logout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Provide the auth context to children components
  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        error,
        isAuthenticated,
        login,
        loginWithGoogle,
        logout,
        register,
        signUp,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the auth context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};