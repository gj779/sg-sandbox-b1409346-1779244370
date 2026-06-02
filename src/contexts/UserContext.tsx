import React, { createContext, useContext, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { UserProfile, UserRole } from "@/types";

interface UserContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, firstName: string, lastName: string, userType: UserRole, phoneNumber?: string) => Promise<UserProfile | null>;
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
    userProfile: auth.userProfile,
    isAuthenticated: !!auth.user,
    isLoading: auth.isLoading,
    error: auth.error,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    fetchUserProfile: auth.fetchUserProfile,
    updateUserProfileData: auth.updateUserProfileData,
    uploadProfilePicture: auth.uploadProfilePicture,
    deleteAccount: auth.deleteAccount,
    clearAuthError: auth.clearAuthError
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
