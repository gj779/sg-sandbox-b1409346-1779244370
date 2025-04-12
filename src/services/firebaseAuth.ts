import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface RegisterUserParams {
  email: string;
  password: string;
  userType: 'applicant' | 'restaurant' | 'admin';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  userType: 'applicant' | 'restaurant' | 'admin';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
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
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
      id: user.uid,
      email,
      userType,
      firstName,
      lastName,
      phoneNumber: phoneNumber || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      // Initialize onboarding fields
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
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return { user, userProfile };
  },

  // Sign in user
  async signIn(email: string, password: string): Promise<{ user: User; userProfile: UserProfile | null }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile from Firestore
      const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
      const userProfile = userProfileDoc.exists() ? userProfileDoc.data() as UserProfile : null;
      
      return { user, userProfile };
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      
      // Provide more user-friendly error messages based on Firebase error codes
      let errorMessage = 'An error occurred during sign in. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
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
            errorMessage = error.message ? error.message.replace(/@/g, 'at') : errorMessage;
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
      console.log(`Attempting to fetch user profile for ID: ${userId}`);
      const userProfileDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userProfileDoc.exists()) {
        console.log(`No user profile found with ID: ${userId}`);
        return null;
      }
      
      const data = userProfileDoc.data();
      console.log(`Successfully retrieved profile for user ${userId}`);
      
      return { 
        id: userId,
        ...data
      } as UserProfile;
    } catch (error) {
      console.error(`Error getting user profile for ${userId}:`, error);
      // Ensure we return null instead of throwing an error
      // This allows the calling code to handle the missing profile gracefully
      return null;
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