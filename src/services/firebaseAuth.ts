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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user profile from Firestore
    const userProfileDoc = await getDoc(doc(db, 'users', user.uid));
    const userProfile = userProfileDoc.exists() ? userProfileDoc.data() as UserProfile : null;
    
    return { user, userProfile };
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
    const userProfileDoc = await getDoc(doc(db, 'users', userId));
    return userProfileDoc.exists() ? userProfileDoc.data() as UserProfile : null;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    
    // Add updatedAt timestamp
    const updatedData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updatedData);
    
    // Get updated profile
    const updatedDoc = await getDoc(userRef);
    return updatedDoc.exists() ? updatedDoc.data() as UserProfile : null;
  }
};