
import { useState, useEffect } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  deleteUser as firebaseDeleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseStorageService } from "@/services/firebaseStorage";
import { UserProfile, UserRole } from "@/types";

interface FirebaseAuthHook {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
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

export function useFirebaseAuth(): FirebaseAuthHook {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetchUserProfile first so it can be used in other functions
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        console.log("User profile fetched:", profile);
        return profile;
      }
      console.log("No user profile found for ID:", userId);
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!auth) {
      console.error("Firebase auth is not initialized");
      setError("Firebase authentication is not properly configured");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User signed in" : "User signed out");
      setUser(user);
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userType: UserRole): Promise<UserProfile | null> => {
    try {
      setError(null);
      setLoading(true);
      console.log("Attempting to sign up user:", email, "with role:", userType);
      
      // Validate inputs
      if (!email || !password || !firstName || !lastName) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Firebase user created successfully:", result.user.uid);
      
      const profile: UserProfile = {
        id: result.user.uid,
        email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        userType,
        profileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      console.log("Creating user profile document:", profile);
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log("User profile created successfully:", result.user.uid);
      setLoading(false);
      return profile;
    } catch (error: any) {
      setLoading(false);
      console.error("Error in signUp:", error);
      
      // Set user-friendly error messages based on Firebase error codes
      let errorMessage = "Failed to create account. Please try again.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email address already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      setError(errorMessage);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      setError(null);
      setLoading(true);
      console.log("Attempting to sign in user:", email);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase auth successful for user:", result.user.uid);
      
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const profile = await fetchUserProfile(result.user.uid);
      
      if (!profile) {
        console.warn("No user profile found for existing user, this might be a sign-up that didn't complete");
        // Don't create a profile here for existing users - they should sign up properly
        setLoading(false);
        throw new Error("Account profile not found. Please contact support or try signing up again.");
      }
      
      console.log("Sign in successful with profile:", result.user.uid);
      setUserProfile(profile);
      setLoading(false);
      return profile;
    } catch (error: any) {
      setLoading(false);
      console.error("Error in signIn:", error);
      
      // Set user-friendly error messages based on Firebase error codes
      let errorMessage = "Sign in failed. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/missing-email':
          errorMessage = 'Please enter an email address.';
          break;
        case 'auth/missing-password':
          errorMessage = 'Please enter a password.';
          break;
        case 'permission-denied':
          errorMessage = 'Unable to access your profile. Please contact support.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      setError(errorMessage);
      return null;
    }
  };

  const signInWithGoogle = async (userType: UserRole): Promise<UserProfile | null> => {
    try {
      setError(null);
      setLoading(true);
      console.log("Attempting Google sign in...");
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

      if (isNewUser) {
        const profile: UserProfile = {
          id: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "",
          photoURL: result.user.photoURL || undefined,
          userType,
          profileComplete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        const userRef = doc(db, "users", result.user.uid);
        await setDoc(userRef, {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setLoading(false);
        return profile;
      }

      const profile = await fetchUserProfile(result.user.uid);
      setLoading(false);
      return profile;
    } catch (error: any) {
      setLoading(false);
      console.error("Error in signInWithGoogle:", error);
      setError("Google sign in failed. Please try again.");
      return null;
    }
  };

  const updateUserProfileData = async (userId: string, data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  };

  const uploadProfilePicture = async (userId: string, file: File): Promise<string | null> => {
    try {
      const photoURL = await firebaseStorageService.uploadProfilePicture(userId, file);
      if (photoURL) {
        await updateUserProfileData(userId, { photoURL });
      }
      return photoURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return null;
    }
  };

  const deleteAccount = async (password?: string): Promise<boolean> => {
    try {
      if (!user || !user.email || !password) return false;
      
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);
      await firebaseDeleteUser(user);
      return true;
    } catch (error) {
      console.error("Error deleting account:", error);
      return false;
    }
  };

  const clearAuthError = () => {
    setError(null);
  };

  return {
    user,
    userProfile,
    loading,
    isLoading: loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut: () => firebaseSignOut(auth),
    resetPassword: async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return true;
      } catch (error) {
        console.error("Error sending password reset email:", error);
        return false;
      }
    },
    fetchUserProfile,
    updateUserProfileData,
    uploadProfilePicture,
    deleteAccount,
    clearAuthError
  };
}

// Add the useAuth alias export
export const useAuth = useFirebaseAuth;