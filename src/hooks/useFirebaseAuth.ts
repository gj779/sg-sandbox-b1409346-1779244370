import { useState, useEffect, useCallback } from "react";
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
import profilesService from "@/services/profilesService";
import { UserProfile, UserRole } from "@/types"; // Ensure UserProfile has photoURL as string | undefined

// Local UserProfile type for this hook
interface UserProfile extends AppUserProfile {
  // This interface should now directly align with AppUserProfile from src/types
  // Ensure all properties like email, name, photoURL match the definitions in AppUserProfile
  // AppUserProfile (via User base) should have:
  // id: string;
  // email: string; // non-optional
  // name: string; // non-optional
  // photoURL?: string; // optional
  // userType: "applicant" | "restaurant" | "admin";
  // firstName?: string;
  // lastName?: string;
}


interface AuthState {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export function useFirebaseAuth() {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const clearAuthError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };
  
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserProfile;
        // Ensure photoURL is handled correctly, even if undefined in Firestore
        return { ...profileData, id: userId, photoURL: profileData.photoURL || undefined };
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      setAuthState(prev => ({ ...prev, error: error.message || "Failed to fetch profile" }));
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) {
          setAuthState({
            user: firebaseUser,
            userProfile: {
              ...profile,
              displayName: profile.displayName || firebaseUser.displayName,
              photoURL: typeof profile.photoURL === "string" ? profile.photoURL : firebaseUser.photoURL,
              role: profile.role || UserRole.APPLICANT, // Default role if not set
              lastLogin: profile.lastLogin ? new Date(profile.lastLogin) : new Date(),
              createdAt: profile.createdAt ? new Date(profile.createdAt) : new Date(),
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: firebaseUser,
            userProfile: {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || firebaseUser.email! || "User",
              photoURL: firebaseUser.photoURL,
              role: UserRole.APPLICANT, // Default role for new user
              customClaims: {},
              lastLogin: new Date(),
              createdAt: new Date(),
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userType: "applicant" | "restaurant"): Promise<UserProfile | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const displayName = `${firstName} ${lastName}`.trim();
      await firebaseUpdateProfile(firebaseUser, { displayName });

      const userProfileData: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email!, // email from FirebaseUser should be non-null
        name: displayName || firebaseUser.displayName || firebaseUser.email! || "User",
        firstName,
        lastName,
        userType,
        photoURL: firebaseUser.photoURL || undefined, // Use undefined for consistency
        // Initialize other fields as required by AppUserProfile or ensure they are optional
        // Example:
        // skills: [], // if skills is string[] and required
        // isActive: true, // if isActive is boolean and required
        // profileComplete: false, // if profileComplete is boolean and required
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userProfileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        profileComplete: false, // Or determine based on initial data
      });
      
      setAuthState(prev => ({
        ...prev,
        user: firebaseUser,
        userProfile: userProfileData,
        isAuthenticated: true,
        isLoading: false,
      }));
      return userProfileData;
    } catch (error: any) {
      console.error("Sign up error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Sign up failed" }));
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const profile = await fetchUserProfile(firebaseUser.uid);
      setAuthState(prev => ({
        ...prev,
        user: firebaseUser,
        userProfile: profile,
        isAuthenticated: true,
        isLoading: false,
      }));
      return profile;
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Sign in failed" }));
      return null;
    }
  };

  const signInWithGoogle = async (userType: "applicant" | "restaurant"): Promise<UserProfile | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);

      let userProfile = await fetchUserProfile(firebaseUser.uid);

      if (additionalUserInfo?.isNewUser || !userProfile) {
        const nameParts = firebaseUser.displayName?.split(" ") || ["", ""];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");
        const displayName = `${firstName} ${lastName}`.trim();

        const newUserProfileData: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: displayName || firebaseUser.displayName || firebaseUser.email! || "User",
          firstName,
          lastName,
          userType,
          photoURL: firebaseUser.photoURL || undefined,
          // Ensure other required fields from AppUserProfile are initialized
          // isActive: true,
          // profileComplete: false,
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...newUserProfileData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          profileComplete: false, // New users need to complete profile
        }, { merge: true }); // Merge true to avoid overwriting if doc somehow exists
        userProfile = newUserProfileData;
      }
      
      setAuthState(prev => ({
        ...prev,
        user: firebaseUser,
        userProfile,
        isAuthenticated: true,
        isLoading: false,
      }));
      return userProfile;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Google sign in failed" }));
      return null;
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await firebaseSignOut(auth);
      setAuthState(initialAuthState); // Reset to initial state, which has isLoading: true
      // Then immediately set isLoading to false after state reset
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      console.error("Sign out error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Sign out failed" }));
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      console.error("Password reset error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Password reset failed" }));
      return false;
    }
  };

  const updateUserProfileData = async (userId: string, data: Partial<UserProfile>): Promise<boolean> => { // Corrected: Added ''
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userDocRef = doc(db, "users", userId);
      const updateData = { ...data, updatedAt: serverTimestamp() };
      await updateDoc(userDocRef, updateData);
      
      // If FirebaseUser display name or photoURL is part of the update
      if (auth.currentUser && (data.firstName || data.lastName || data.photoURL)) {
        const currentProfile = await fetchUserProfile(userId); // Get potentially merged profile
        const displayName = `${data.firstName || currentProfile?.firstName || ""} ${data.lastName || currentProfile?.lastName || ""}`.trim();
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: displayName || undefined, // firebaseUpdateProfile expects undefined for no change
          photoURL: data.photoURL !== undefined ? data.photoURL : currentProfile?.photoURL || undefined,
        });
      }
      
      const updatedProfile = await fetchUserProfile(userId);
      setAuthState(prev => ({
        ...prev,
        userProfile: updatedProfile,
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      console.error("Update profile error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Profile update failed" }));
      return false;
    }
  };

  const uploadProfilePicture = async (userId: string, file: File): Promise<string | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const filePath = `profiles/${userId}/${file.name}`;
      const photoURL = await firebaseStorageService.uploadFile(filePath, file);
      
      if (photoURL) {
        await updateUserProfileData(userId, { photoURL }); // This will also update FirebaseUser
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return photoURL;
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Profile picture upload failed" }));
      return null;
    }
  };

  const deleteAccount = async (password?: string): Promise<boolean> => {
    if (!authState.user) {
      setAuthState(prev => ({ ...prev, error: "No user to delete." }));
      return false;
    }
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const firebaseUser = authState.user;
      
      // Re-authentication might be needed for security-sensitive operations
      if (password) {
        const credential = EmailAuthProvider.credential(firebaseUser.email!, password);
        await reauthenticateWithCredential(firebaseUser, credential);
      }

      // Delete user data from Firestore (and Storage if applicable)
      await deleteDoc(doc(db, "users", firebaseUser.uid));
      // Add calls to delete storage files if necessary, e.g., profile picture

      await firebaseDeleteUser(firebaseUser);
      
      setAuthState(initialAuthState); // Reset state
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      console.error("Delete account error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Failed to delete account." }));
      return false;
    }
  };


  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    fetchUserProfile,
    updateUserProfileData,
    uploadProfilePicture,
    deleteAccount,
    clearAuthError,
  };
}