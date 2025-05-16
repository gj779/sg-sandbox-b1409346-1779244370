
import React, { createContext, useContext, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { UserProfile as AppUserProfile, UserRole } from "@/types";

// Local UserProfile type for this context
interface UserProfile extends Omit<AppUserProfile, 'userType'> {
  id: string;
  userType: UserRole;
}

interface UserContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, firstName: string, lastName: string, userType: UserRole) => Promise<UserProfile | null>;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signInWithGoogle: (userType: UserRole) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfileData: (userId: string, data: Partial<UserProfile>) => Promise<boolean>;
  uploadProfilePicture: (userId: string, file: File) => Promise<string | null>;
  deleteAccount: (password?: string) => Promise<boolean>;
  clearAuthError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();

  const contextValue: UserContextType = {
    user: auth.user,
    userProfile: auth.userProfile as UserProfile | null,
    isAuthenticated: !!auth.user,
    isLoading: auth.loading,
    error: null,
    signUp: async (email, password, firstName, lastName, userType) => {
      const result = await auth.signUp(email, password);
      // Additional logic to create user profile
      return null; // Replace with actual implementation
    },
    signIn: async (email, password) => {
      const result = await auth.signIn(email, password);
      // Additional logic to fetch user profile
      return null; // Replace with actual implementation
    },
    signInWithGoogle: async (userType) => {
      const result = await auth.signInWithGoogle();
      // Additional logic to handle Google sign-in
      return null; // Replace with actual implementation
    },
    signOut: auth.signOut,
    resetPassword: async (email) => {
      // Implement reset password logic
      return true;
    },
    fetchUserProfile: async (userId) => {
      // Implement fetch profile logic
      return null;
    },
    updateUserProfileData: async (userId, data) => {
      // Implement update profile logic
      return true;
    },
    uploadProfilePicture: async (userId, file) => {
      // Implement upload logic
      return null;
    },
    deleteAccount: async (password) => {
      // Implement delete account logic
      return true;
    },
    clearAuthError: () => {
      // Implement clear error logic
    }
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
