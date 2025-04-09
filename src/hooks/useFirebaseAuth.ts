
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
  // Restaurant specific fields
  businessName?: string;
  businessAddress?: string;
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
          
          // If we got a profile back, set it in state
          if (userProfile) {
            setAuthState({
              isAuthenticated: true,
              user,
              userProfile,
              isLoading: false,
              error: null,
            });
          } else {
            // If no profile, create a mock profile with basic user info
            const mockProfile: UserProfile = {
              id: user.uid,
              email: user.email || "",
              firstName: user.displayName?.split(' ')[0] || "",
              lastName: user.displayName?.split(' ')[1] || "",
              userType: "applicant", // Default type
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            setAuthState({
              isAuthenticated: true,
              user,
              userProfile: mockProfile,
              isLoading: false,
              error: "Profile data incomplete. Some features may be limited.",
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Create a fallback profile with basic user info
          const fallbackProfile: UserProfile = {
            id: user.uid,
            email: user.email || "",
            firstName: user.displayName?.split(' ')[0] || "",
            lastName: user.displayName?.split(' ')[1] || "",
            userType: "applicant", // Default type
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          setAuthState({
            isAuthenticated: true,
            user,
            userProfile: fallbackProfile,
            isLoading: false,
            error: "Failed to load complete user profile. Using limited profile data.",
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
      
      // Get the correct dashboard path based on user type
      const dashboardPath = firebaseAuthService.getDashboardPath(userProfile?.userType);
      
      // Update auth state with user info
      setAuthState({
        isAuthenticated: true,
        user,
        userProfile,
        isLoading: false,
        error: null,
      });
      
      // Return both the user profile and the dashboard path
      return { userProfile, dashboardPath };
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
      
      // Update auth state with new user
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        userProfile: result.userProfile,
        isLoading: false,
        error: null,
      });
      
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
      
      // Clear auth state
      setAuthState({
        isAuthenticated: false,
        user: null,
        userProfile: null,
        isLoading: false,
        error: null,
      });
      
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
      throw new Error('User not authenticated');
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Create a merged profile as a fallback
      const mergedProfile: UserProfile = {
        ...(authState.userProfile || {}),
        ...updates,
        id: authState.user.uid,
        email: authState.user.email || "",
        updatedAt: new Date()
      } as UserProfile;
      
      // Try to update with Firebase service
      let updatedProfile: UserProfile | null = null;
      
      try {
        // Call the Firebase service to update the profile
        updatedProfile = await firebaseAuthService.updateUserProfile(authState.user.uid, updates);
      } catch (firebaseError) {
        console.error('Firebase update failed:', firebaseError);
        // Continue with fallback - we'll handle this below
      }
      
      // If Firebase update succeeds, use that profile, otherwise use our merged profile
      const finalProfile = updatedProfile || mergedProfile;
      
      // Update the local state
      setAuthState(prev => ({
        ...prev,
        userProfile: finalProfile,
        isLoading: false,
        error: updatedProfile ? null : "Profile updated locally only. Changes may not persist after logout.",
      }));
      
      return finalProfile;
    } catch (error: any) {
      console.error("Profile update error:", error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update profile',
      }));
      throw error;
    }
  }, [authState.user, authState.userProfile]);

  // Refresh user profile - useful when profile data might have changed
  const refreshUserProfile = useCallback(async () => {
    if (!authState.user?.uid) {
      return null;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const userProfile = await firebaseAuthService.getUserProfile(authState.user.uid);
      
      setAuthState(prev => ({
        ...prev,
        userProfile,
        isLoading: false,
        error: userProfile ? null : "Failed to refresh user profile",
      }));
      
      return userProfile;
    } catch (error: any) {
      console.error("Error refreshing profile:", error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to refresh user profile",
      }));
      return null;
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
    refreshUserProfile,
  };
}
