
import React, { createContext, useContext, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { UserProfile as AppUserProfile } from "@/types"; // Use AppUserProfile from global types

// Local UserProfile type for this context, ensuring photoURL is optional
interface UserProfile extends Omit<AppUserProfile, "photoURL"> {
  photoURL?: string; // Explicitly optional
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  userType?: "applicant" | "restaurant" | "admin";
}

interface UserContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Renamed from loading for clarity
  error: string | null;
  signUp: (email: string, password: string, firstName: string, lastName: string, userType: "applicant" | "restaurant") => Promise<UserProfile | null>;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signInWithGoogle: (userType: "applicant" | "restaurant") => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfileData: (userId: string,  Partial<UserProfile>) => Promise<boolean>;
  uploadProfilePicture: (userId: string, file: File) => Promise<string | null>;
  deleteAccount: (password?: string) => Promise<boolean>;
  clearAuthError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();

  // Adapt the auth object to match UserContextType, especially userProfile
  const contextValue: UserContextType = {
    ...auth,
    isLoading: auth.isLoading, // Ensure this matches
    userProfile: auth.userProfile as UserProfile | null, // Cast if necessary, ensure types align
    fetchUserProfile: auth.fetchUserProfile as (userId: string) => Promise<UserProfile | null>,
    updateUserProfileData: auth.updateUserProfileData as (userId: string,  Partial<UserProfile>) => Promise<boolean>,
    signUp: auth.signUp as (email: string, password: string, firstName: string, lastName: string, userType: "applicant" | "restaurant") => Promise<UserProfile | null>,
    signIn: auth.signIn as (email: string, password: string) => Promise<UserProfile | null>,
    signInWithGoogle: auth.signInWithGoogle as (userType: "applicant" | "restaurant") => Promise<UserProfile | null>,

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
