
import { useState, useEffect, useCallback } from "react";
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, // Ensured firebaseSignOut is imported
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
import { UserProfile as UserProfileFromTypes, UserRole } from "@/types";

interface AuthState {
  user: FirebaseUser | null;
  userProfile: UserProfileFromTypes | null;
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
  
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfileFromTypes | null> => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profileData = userDocSnap.data() as UserProfileFromTypes;
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
        const baseUserProfile: UserProfileFromTypes = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: profile?.name || firebaseUser.displayName || firebaseUser.email! || "User",
          photoURL: profile?.photoURL || firebaseUser.photoURL || undefined,
          userType: profile?.userType || UserRole.APPLICANT,
          firstName: profile?.firstName || firebaseUser.displayName?.split(" ")[0] || "",
          lastName: profile?.lastName || firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
          createdAt: profile?.createdAt ? new Date(profile.createdAt) : new Date(),
          updatedAt: profile?.updatedAt ? new Date(profile.updatedAt) : new Date(),
          profileComplete: profile?.profileComplete || false,
          isActive: profile?.isActive || true,
        };

        setAuthState({
          user: firebaseUser,
          userProfile: {
            ...baseUserProfile,
            ...profile,
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: profile?.name || firebaseUser.displayName || firebaseUser.email! || "User",
            photoURL: profile?.photoURL || firebaseUser.photoURL || undefined,
            userType: profile?.userType || UserRole.APPLICANT,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({ ...initialAuthState, isLoading: false });
      }
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userType: "applicant" | "restaurant"): Promise<UserProfileFromTypes | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const displayName = `${firstName} ${lastName}`.trim();
      await firebaseUpdateProfile(firebaseUser, { displayName });

      const userProfileData: UserProfileFromTypes = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: displayName,
        firstName,
        lastName,
        userType,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        profileComplete: false,
        isActive: true,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userProfileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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

  const signIn = async (email: string, password: string): Promise<UserProfileFromTypes | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const profile = await fetchUserProfile(firebaseUser.uid);
      
      const userProfileToSet: UserProfileFromTypes | null = profile ? {
        ...profile,
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: profile.name || firebaseUser.displayName || firebaseUser.email!,
        photoURL: profile.photoURL || firebaseUser.photoURL || undefined,
        userType: profile.userType || UserRole.APPLICANT,
      } : null;

      if (userProfileToSet && firebaseUser) {
         await updateDoc(doc(db, "users", firebaseUser.uid), {
            lastLogin: serverTimestamp(),
            name: userProfileToSet.name,
            photoURL: userProfileToSet.photoURL,
        });
      }

      setAuthState(prev => ({
        ...prev,
        user: firebaseUser,
        userProfile: userProfileToSet,
        isAuthenticated: true,
        isLoading: false,
      }));
      return userProfileToSet;
    } catch (error: any) {
      console.error("Sign in error:", error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: error.message || "Sign in failed" }));
      return null;
    }
  };

  const signInWithGoogle = async (userType: "applicant" | "restaurant"): Promise<UserProfileFromTypes | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);

      let userProfile = await fetchUserProfile(firebaseUser.uid);

      if (additionalUserInfo?.isNewUser || !userProfile) {
        const nameParts = firebaseUser.displayName?.split(" ") || ["", ""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        const newUserProfileData: UserProfileFromTypes = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || firebaseUser.email!,
          firstName,
          lastName,
          userType,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          profileComplete: false,
          isActive: true,
        };
        
        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...newUserProfileData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        userProfile = newUserProfileData;
      } else if (userProfile) {
         await updateDoc(doc(db, "users", firebaseUser.uid), {
            lastLogin: serverTimestamp(),
            name: firebaseUser.displayName || userProfile.name,
            photoURL: firebaseUser.photoURL || userProfile.photoURL,
            userType: userProfile.userType || userType,
        });
        userProfile = await fetchUserProfile(firebaseUser.uid);
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

  // Correctly defined signOut function
  const signOut = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await firebaseSignOut(auth); // Using the imported firebaseSignOut
      setAuthState({ ...initialAuthState, isLoading: false });
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

  // Corrected updateUserProfileData signature
  const updateUserProfileData = async (userId: string,  Partial<UserProfileFromTypes>): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userDocRef = doc(db, "users", userId);
      const updatePayload = { ...data, updatedAt: serverTimestamp() }; // Use a different name for the payload to avoid confusion if 'data' is used later
      await updateDoc(userDocRef, updatePayload);
      
      // Ensure auth.currentUser exists and data contains updatable profile fields
      if (auth.currentUser && (data.name || data.photoURL || data.firstName || data.lastName)) {
        // Fetch the most recent profile state or use existing from authState
        const currentProfile = authState.userProfile ? { ...authState.userProfile, ...data } : await fetchUserProfile(userId);
        
        // Construct displayName carefully
        let displayName = data.name;
        if (!displayName && currentProfile) {
            if (data.firstName && data.lastName) {
                displayName = `${data.firstName} ${data.lastName}`.trim();
            } else if (data.firstName && currentProfile.lastName) {
                displayName = `${data.firstName} ${currentProfile.lastName}`.trim();
            } else if (currentProfile.firstName && data.lastName) {
                displayName = `${currentProfile.firstName} ${data.lastName}`.trim();
            } else if (currentProfile.firstName && currentProfile.lastName) {
                displayName = `${currentProfile.firstName} ${currentProfile.lastName}`.trim();
            } else {
                displayName = currentProfile.name;
            }
        }


        await firebaseUpdateProfile(auth.currentUser, {
          displayName: displayName || undefined,
          photoURL: data.photoURL !== undefined ? data.photoURL : (currentProfile?.photoURL || undefined),
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
      const uploadedFileMetadata = await firebaseStorageService.uploadFile(filePath, file, { ownerId: userId }); 
      
      if (uploadedFileMetadata && uploadedFileMetadata.downloadURL) {
        // Pass an object to updateUserProfileData
        await updateUserProfileData(userId, { photoURL: uploadedFileMetadata.downloadURL }); 
      }
      
      const updatedProfile = await fetchUserProfile(userId);
      setAuthState(prev => ({ 
        ...prev, 
        userProfile: updatedProfile,
        isLoading: false 
      }));
      return uploadedFileMetadata?.downloadURL || null;
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
      
      if (password && firebaseUser.email) { // Ensure email is not null
        const credential = EmailAuthProvider.credential(firebaseUser.email, password);
        await reauthenticateWithCredential(firebaseUser, credential);
      }

      await deleteDoc(doc(db, "users", firebaseUser.uid));
      await firebaseDeleteUser(firebaseUser);
      
      setAuthState({...initialAuthState, isLoading: false}); // Reset to initial state but keep isLoading false
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
    signOut, // Ensuring signOut is returned
    resetPassword,
    fetchUserProfile,
    updateUserProfileData,
    uploadProfilePicture,
    deleteAccount,
    clearAuthError,
  };
}
