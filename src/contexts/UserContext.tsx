import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth, UserProfile } from '@/hooks/useFirebaseAuth';
import { User } from 'firebase/auth';

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
  logout: () => Promise<void>;
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
    signOut,
    signUp,
    updateUserProfile,
    refreshUserProfile,
  } = useFirebaseAuth();

  const router = useRouter();

  // Handle error logging
  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  // Improved login function with better error handling
  const login = async (email: string, password: string) => {
    try {
      return await signIn(email, password);
    } catch (error: any) {
      console.error('Login error in context:', error);
      // Ensure we're returning a clean error message
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : 'Failed to sign in';
      throw new Error(errorMessage);
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
        logout,
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