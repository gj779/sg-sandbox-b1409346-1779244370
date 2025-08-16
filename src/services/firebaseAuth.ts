import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getAdditionalUserInfo // Import getAdditionalUserInfo
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserRole } from '@/types';

export interface RegisterUserParams {
  email: string;
  password: string;
  userType: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  userType: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  // Add fields used in onboarding
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
  profileComplete?: boolean;
  // Restaurant specific fields
  businessName?: string;
  businessAddress?: string;
}

export const firebaseAuthService = {
  // Register a new user
  async registerUser({
    email,
    password,
    userType,
    firstName,
    lastName,
    phoneNumber,
  }: RegisterUserParams): Promise<{ user: User; userProfile: UserProfile }> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user profile in Firestore - MINIMAL PROFILE ONLY
      const userProfile = {
        email,
        userType,
        firstName,
        lastName,
        // Only include the required fields for initial creation
        // Optional fields will be added during onboarding
        isActive: true,
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log("Creating user profile document:", userProfile);
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Fetch back the profile to get proper timestamps
      const createdDoc = await getDoc(doc(db, 'users', user.uid));
      const createdProfile = createdDoc.exists() ? {
        id: user.uid,
        ...createdDoc.data()
      } as UserProfile : null;
      
      if (!createdProfile) {
        throw new Error("Failed to create user profile");
      }
      
      return { user, userProfile: createdProfile };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'An error occurred during registration. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already in use. Please try a different email or sign in.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format. Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'permission-denied':
            errorMessage = 'Permission denied. There may be an issue with the database rules.';
            break;
          default:
            errorMessage = error.message ? error.message.replace(/@/g, ' at ') : errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Sign in with Google
  async signInWithGoogle(userType: UserRole = UserRole.APPLICANT): Promise<{ user: User; userProfile: UserProfile | null; isNewUser: boolean }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // const credential = GoogleAuthProvider.credentialFromResult(result); // Keep if needed for other purposes
      
      // Check if this is a new user using getAdditionalUserInfo
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser || false;
      
      // Get or create user profile
      let userProfile = await this.getUserProfile(user.uid);
      
      // If new user or no profile exists, create one
      if (isNewUser || !userProfile) {
        // Extract name parts from displayName
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Create new profile
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          userType,
          firstName,
          lastName,
          phoneNumber: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          skills: [],
          experience: '',
          availability: [],
          preferredLocation: '',
          bio: '',
          education: '',
          jobPreferences: [],
          location: '',
          cuisineType: '',
          hiringPositions: [],
          jobTypes: [],
          benefits: '',
          profileComplete: false,
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), newProfile);
        
        // Get the profile with server timestamps
        userProfile = await this.getUserProfile(user.uid);
      }
      
      return { user, userProfile, isNewUser };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'The popup was blocked by your browser. Please allow popups for this website and try again.';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'The sign-in popup was closed before completing the sign in. Please try again.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'The sign-in operation was cancelled. Please try again.';
            break;
          default:
            errorMessage = error.message ? error.message.replace(/@/g, ' at ') : errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Handle redirect result (for mobile devices)
  async handleRedirectResult(): Promise<{ user: User; userProfile: UserProfile | null; isNewUser: boolean } | null> {
    try {
      const result = await getRedirectResult(auth);
      
      if (!result) {
        return null;
      }
      
      const user = result.user;
      // Check if this is a new user using getAdditionalUserInfo
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser || false;
      
      // Get or create user profile
      let userProfile = await this.getUserProfile(user.uid);
      
      // If new user or no profile exists, create one
      if (isNewUser || !userProfile) {
        // Extract name parts from displayName
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Default to applicant for redirect flow
        const userType = UserRole.APPLICANT;
        
        // Create new profile
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          userType,
          firstName,
          lastName,
          phoneNumber: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          skills: [],
          experience: '',
          availability: [],
          preferredLocation: '',
          bio: '',
          education: '',
          jobPreferences: [],
          location: '',
          cuisineType: '',
          hiringPositions: [],
          jobTypes: [],
          benefits: '',
          profileComplete: false,
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), newProfile);
        
        // Get the profile with server timestamps
        userProfile = await this.getUserProfile(user.uid);
      }
      
      return { user, userProfile, isNewUser };
    } catch (error: any) {
      console.error('Redirect result error:', error);
      throw error;
    }
  },

  // Sign in user
  async signIn(email: string, password: string): Promise<{ user: User; userProfile: UserProfile | null }> {
    try {
      // Trim email and password to prevent whitespace issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password;
      
      console.log(`Attempting to sign in with email: ${trimmedEmail}`);
      
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      
      console.log(`User signed in successfully: ${user.uid}`);
      
      // Get user profile from Firestore
      const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
      const userProfile = userProfileDoc.exists() ? userProfileDoc.data() as UserProfile : null;
      
      if (!userProfile) {
        console.log(`No profile found for user ${user.uid}, will create default profile`);
      } else {
        console.log(`User profile found with type: ${userProfile.userType}`);
      }
      
      return { user, userProfile };
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      
      // Provide more user-friendly error messages based on Firebase error codes
      let errorMessage = 'An error occurred during sign in. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/invalid-login-credentials':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format. Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = error.message ? error.message.replace(/@/g, ' at ') : errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Get dashboard path based on user type
  getDashboardPath(userType: string | undefined): string {
    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'restaurant':
        return '/restaurant/dashboard';
      case 'applicant':
        return '/applicant/dashboard';
      default:
        return '/';
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    return signOut(auth);
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  // Reset password
  async resetPassword(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(auth, oobCode, newPassword);
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserProfile, 'id'>;
        
        // Convert Firestore Timestamps to JavaScript Dates
        const createdAt = userData.createdAt instanceof Timestamp 
          ? userData.createdAt.toDate() 
          : userData.createdAt;
          
        const updatedAt = userData.updatedAt instanceof Timestamp 
          ? userData.updatedAt.toDate() 
          : userData.updatedAt;
        
        return {
          id: userDoc.id,
          ...userData,
          createdAt,
          updatedAt
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Sanitize error message to remove @ symbols
      const errorMessage = error instanceof Error 
        ? error.message.replace(/@/g, ' at ') 
        : 'Unknown error occurred while fetching user profile';
      throw new Error(errorMessage);
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log(`Attempting to update profile for user ${userId}`);
      const userRef = doc(db, 'users', userId);
      
      // Check if user exists first
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.error(`User with ID ${userId} does not exist`);
        return null;
      }
      
      // Get current user data
      const currentUserData = userDoc.data();
      
      // Add updatedAt timestamp
      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      // Update the document
      await updateDoc(userRef, updatedData);
      console.log(`Successfully updated profile for user ${userId}`);
      
      // Create a merged profile with updated data
      const mergedProfile = {
        id: userId,
        ...currentUserData,
        ...updates,
        updatedAt: new Date() // Use a JavaScript Date for immediate use
      };
      
      // Return the merged profile without waiting for another Firestore read
      return mergedProfile as UserProfile;
    } catch (error) {
      console.error(`Error updating user profile for ${userId}:`, error);
      // Improve error message to avoid @ symbol in error message
      const errorMessage = error instanceof Error 
        ? error.message.replace(/@/g, 'at') 
        : 'Failed to update profile';
      throw new Error(errorMessage);
    }
  }
};