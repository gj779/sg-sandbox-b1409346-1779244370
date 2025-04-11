import { useState, useEffect, useCallback } from "react";
import { firebaseAuthService } from "@/services/firebaseAuth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/router";
import type { UserProfile as FirebaseUserProfile } from "@/services/firebaseAuth";

// Define a UserProfile type that matches what we're using in the app
export interface UserProfile {
  id: string; // Changed from optional to required to match firebaseAuth.ts
  email: string; // Changed from optional to required to match firebaseAuth.ts
  name?: string;
  photoURL?: string;
  phoneNumber?: string;
  userType: "applicant" | "restaurant" | "admin"; // Changed from optional to required to match firebaseAuth.ts
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
  isActive: boolean; // Changed from optional to required to match firebaseAuth.ts
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
              firstName: user.displayName?.split(' ')[0] || "User",
              lastName: user.displayName?.split(' ')[1] || "",
              userType: "applicant", // Default type
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              // Add default values for required fields to prevent undefined errors
              bio: "",
              preferredLocation: "",
              skills: [],
              experience: "",
              education: "",
              businessName: "",
              businessAddress: "",
              cuisineType: ""
            };
            
            setAuthState({
              isAuthenticated: true,
              user,
              userProfile: mockProfile,
              isLoading: false,
              error: "Profile data incomplete. Some features may be limited.",
            });
            
            // Try to create a basic profile in Firestore
            try {
              await firebaseAuthService.updateUserProfile(user.uid, mockProfile);
            } catch (createError) {
              console.error("Failed to create basic profile:", createError);
            }
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Create a fallback profile with basic user info
          const fallbackProfile: UserProfile = {
            id: user.uid,
            email: user.email || "",
            firstName: user.displayName?.split(' ')[0] || "User",
            lastName: user.displayName?.split(' ')[1] || "",
            userType: "applicant", // Default type
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Add default values for required fields
            bio: "",
            preferredLocation: "",
            skills: [],
            experience: "",
            education: "",
            businessName: "",
            businessAddress: "",
            cuisineType: ""
          };
          
          setAuthState({
            isAuthenticated: true,
            user,
            userProfile: fallbackProfile,
            isLoading: false,
            error: "Failed to load complete user profile. Using limited profile data.",
          });
          
          // Try to create a basic profile in Firestore
          try {
            await firebaseAuthService.updateUserProfile(user.uid, fallbackProfile);
          } catch (createError) {
            console.error("Failed to create fallback profile:", createError);
          }
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
      
      // Create a default profile if none exists
      let finalUserProfile: UserProfile;
      if (!userProfile) {
        const defaultProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ')[1] || '',
          userType: email.includes('restaurant') ? 'restaurant' : 'applicant',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          bio: '',
          preferredLocation: '',
          skills: [],
          experience: '',
          education: '',
          businessName: '',
          businessAddress: '',
          cuisineType: ''
        };
        
        try {
          const updatedProfile = await firebaseAuthService.updateUserProfile(user.uid, defaultProfile);
          finalUserProfile = updatedProfile || defaultProfile;
        } catch (error) {
          console.error('Failed to create default profile:', error);
          finalUserProfile = defaultProfile;
        }
      } else {
        finalUserProfile = userProfile as UserProfile;
      }
      
      // Get the correct dashboard path based on user type
      const dashboardPath = firebaseAuthService.getDashboardPath(finalUserProfile?.userType);
      
      // Update auth state with user info
      setAuthState({
        isAuthenticated: true,
        user,
        userProfile: finalUserProfile,
        isLoading: false,
        error: null,
      });
      
      // Return both the user profile and the dashboard path
      return { userProfile: finalUserProfile, dashboardPath };
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to sign in',
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
        userProfile: result.userProfile as UserProfile,
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
        ...(authState.userProfile || {}) as UserProfile,
        ...updates,
        id: authState.user.uid,
        email: authState.user.email || '',
        userType: authState.userProfile?.userType || 'applicant',
        isActive: authState.userProfile?.isActive || true,
        updatedAt: new Date()
      };
      
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
        error: updatedProfile ? null : 'Profile updated locally only. Changes may not persist after logout.',
      }));
      
      return finalProfile;
    } catch (error: any) {
      console.error('Profile update error:', error);
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
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const userProfile = await firebaseAuthService.getUserProfile(authState.user.uid);
      
      if (userProfile) {
        // Convert the Firebase UserProfile to our local UserProfile type
        const typedUserProfile: UserProfile = {
          id: userProfile.id,
          email: userProfile.email,
          userType: userProfile.userType,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          phoneNumber: userProfile.phoneNumber || '',
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
          isActive: userProfile.isActive,
          skills: userProfile.skills || [],
          experience: userProfile.experience || '',
          availability: userProfile.availability || [],
          preferredLocation: userProfile.preferredLocation || '',
          bio: userProfile.bio || '',
          education: userProfile.education || '',
          jobPreferences: userProfile.jobPreferences || [],
          location: userProfile.location || '',
          cuisineType: userProfile.cuisineType || '',
          businessName: userProfile.businessName || '',
          businessAddress: userProfile.businessAddress || '',
        };
        
        setAuthState(prev => ({
          ...prev,
          userProfile: typedUserProfile,
          isLoading: false,
          error: null,
        }));
        
        return typedUserProfile;
      } else {
        // If no profile found, create a default one
        const defaultProfile: UserProfile = {
          id: authState.user.uid,
          email: authState.user.email || '',
          firstName: authState.user.displayName?.split(' ')[0] || 'User',
          lastName: authState.user.displayName?.split(' ')[1] || '',
          userType: authState.userProfile?.userType || 'applicant',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          bio: '',
          preferredLocation: '',
          skills: [],
          experience: '',
          education: '',
          businessName: '',
          businessAddress: '',
          cuisineType: ''
        };
        
        try {
          // Create a new profile in Firebase
          const updatedProfile = await firebaseAuthService.updateUserProfile(authState.user.uid, defaultProfile);
          
          // If Firebase update succeeds, use that profile, otherwise use our default profile
          const finalProfile = updatedProfile || defaultProfile;
          
          setAuthState(prev => ({
            ...prev,
            userProfile: finalProfile,
            isLoading: false,
            error: updatedProfile ? null : 'Created local profile only. Changes may not persist after logout.',
          }));
          
          return finalProfile;
        } catch (error) {
          console.error('Failed to create default profile during refresh:', error);
          setAuthState(prev => ({
            ...prev,
            userProfile: defaultProfile,
            isLoading: false,
            error: 'Created local profile only. Changes may not persist after logout.',
          }));
          return defaultProfile;
        }
      }
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      // Create a fallback profile
      const fallbackProfile: UserProfile = {
        id: authState.user.uid,
        email: authState.user.email || '',
        firstName: authState.user.displayName?.split(' ')[0] || 'User',
        lastName: authState.user.displayName?.split(' ')[1] || '',
        userType: authState.userProfile?.userType || 'applicant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: '',
        preferredLocation: '',
        skills: [],
        experience: '',
        education: '',
        businessName: '',
        businessAddress: '',
        cuisineType: ''
      };
      
      setAuthState(prev => ({
        ...prev,
        userProfile: fallbackProfile,
        isLoading: false,
        error: error.message || 'Failed to refresh user profile. Using fallback data.',
      }));
      return fallbackProfile;
    }
  }, [authState.user, authState.userProfile]);

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