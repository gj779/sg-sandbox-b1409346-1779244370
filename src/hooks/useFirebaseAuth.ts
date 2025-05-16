
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, userType: UserRole): Promise<UserProfile | null> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const profile: UserProfile = {
        id: result.user.uid,
        userId: result.user.uid,
        email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        userType,
        profileComplete: false
      };
      
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return profile;
    } catch (error) {
      console.error("Error in signUp:", error);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await fetchUserProfile(result.user.uid);
    } catch (error) {
      console.error("Error in signIn:", error);
      return null;
    }
  };

  const signInWithGoogle = async (userType: UserRole): Promise<UserProfile | null> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

      if (isNewUser) {
        const profile: UserProfile = {
          id: result.user.uid,
          userId: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "",
          photoURL: result.user.photoURL || undefined,
          userType,
          profileComplete: false
        };

        const userRef = doc(db, "users", result.user.uid);
        await setDoc(userRef, {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        return profile;
      }

      return await fetchUserProfile(result.user.uid);
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
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
