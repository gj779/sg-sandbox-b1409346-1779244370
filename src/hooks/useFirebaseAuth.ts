import { useState, useEffect, useCallback } from "react";
import { firebaseAuthService } from "@/services/firebaseAuth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/router";
import type { UserProfile as FirebaseUserProfile } from "@/services/firebaseAuth";

// Define a UserProfile type that matches what we're using in the app
export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  photoURL?: string;
  phoneNumber?: string;
  userType?: "applicant" | "restaurant" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
  profileComplete?: boolean;
  // Add other fields that might be updated
  skills?: string[];
  experience?: string;
  availability?: string[];
  preferredLocation?: string;
  bio?: string;
  education?: string;
  jobPreferences?: string[];
  location?: string;
  cuisineType?: string;
  hiringPositions?: string[];
  jobTypes?: string[];
  benefits?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function useFirebaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    userProfile: null,
    isLoading: true,
    error: null,
  });
  
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user profile from Firestore
          const userProfile = await firebaseAuthService.getUserProfile(user.uid);
          
          setAuthState({
            isAuthenticated: true,
            user,
            userProfile,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          setAuthState({
            isAuthenticated: true,
            user,
            userProfile: null,
            isLoading: false,
            error: "Failed to load user profile",
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          userProfile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, userProfile } = await firebaseAuthService.signIn(email, password);
      
      return userProfile;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign in",
      }));
      throw error;
    }
  }, []);

  // Sign up function
  const signUp = useCallback(async (userData: {
    email: string;
    password: string;
    userType: "applicant" | "restaurant";
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await firebaseAuthService.registerUser(userData);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return result;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign up",
      }));
      throw error;
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await firebaseAuthService.signOut();
      
      router.push("/");
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign out",
      }));
    }
  }, [router]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await firebaseAuthService.forgotPassword(email);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to initiate password reset",
      }));
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (oobCode: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await firebaseAuthService.resetPassword(oobCode, newPassword);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to reset password",
      }));
      throw error;
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.user?.uid) {
      throw new Error("User not authenticated");
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedProfile = await firebaseAuthService.updateUserProfile(authState.user.uid, updates);
      
      if (updatedProfile) {
        setAuthState(prev => ({
          ...prev,
          userProfile: updatedProfile,
          isLoading: false,
          error: null,
        }));
      }
      
      return updatedProfile;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to update profile",
      }));
      throw error;
    }
  }, [authState.user]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    updateUserProfile,
  };
}