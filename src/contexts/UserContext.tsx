
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
    isLoading: auth.loading || false,
    error: null,
    signUp: async (email, password, firstName, lastName, userType) => {
      try {
        const result = await auth.signUp(email, password);
        if (!result) return null;
        
        // Create user profile
        const profile: UserProfile = {
          id: result.user.uid,
          userId: result.user.uid,
          displayName: `${firstName} ${lastName}`,
          email: email,
          firstName,
          lastName,
          userType,
          profileComplete: false
        };
        
        return profile;
      } catch (error) {
        console.error("Error in signUp:", error);
        return null;
      }
    },
    signIn: async (email, password) => {
      try {
        const result = await auth.signIn(email, password);
        if (!result) return null;
        
        // Fetch user profile
        return null; // Replace with actual profile fetch
      } catch (error) {
        console.error("Error in signIn:", error);
        return null;
      }
    },
    signInWithGoogle: async (userType) => {
      try {
        const result = await auth.signInWithGoogle();
        if (!result) return null;
        
        // Create or fetch user profile
        return null; // Replace with actual profile handling
      } catch (error) {
        console.error("Error in signInWithGoogle:", error);
        return null;
      }
    },
    signOut: auth.signOut,
    resetPassword: async (email) => {
      try {
        // Implement reset password logic
        return true;
      } catch (error) {
        console.error("Error in resetPassword:", error);
        return false;
      }
    },
    fetchUserProfile: async (userId) => {
      try {
        // Implement fetch profile logic
        return null;
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        return null;
      }
    },
    updateUserProfileData: async (userId, data) => {
      try {
        // Implement update profile logic
        return true;
      } catch (error) {
        console.error("Error in updateUserProfileData:", error);
        return false;
      }
    },
    uploadProfilePicture: async (userId, file) => {
      try {
        // Implement upload logic
        return null;
      } catch (error) {
        console.error("Error in uploadProfilePicture:", error);
        return null;
      }
    },
    deleteAccount: async (password) => {
      try {
        // Implement delete account logic
        return true;
      } catch (error) {
        console.error("Error in deleteAccount:", error);
        return false;
      }
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
