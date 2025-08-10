
import { 
  where, 
  QueryConstraint,
  collection,
  query,
  getDocs,
  doc,
  setDoc
} from 'firebase/firestore';
import { firebaseDatabaseService } from './firebaseDatabase';
import { db } from "@/lib/firebase";
import { z } from 'zod';
import { UserProfile, UserRole } from "@/types";

// Define the UserProfile schema for validation
export const userProfileSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email format"),
  userType: z.nativeEnum(UserRole),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  
  // Applicant specific fields
  skills: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(),
  availability: z.array(z.string()).optional(),
  preferredLocation: z.string().optional(),
  bio: z.string().optional(),
  education: z.array(z.string()).optional(),
  jobPreferences: z.array(z.string()).optional(),
  location: z.string().optional(),
  
  // Restaurant specific fields
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessDescription: z.string().optional(),
  cuisineType: z.string().optional(),
  hiringPositions: z.array(z.string()).optional(),
  jobTypes: z.array(z.string()).optional(),
  benefits: z.string().optional(),
  
  // Profile completion flag
  profileComplete: z.boolean().optional()
});

// Collection path
const USERS_COLLECTION = 'users';

// Helper function to convert string to UserRole enum
const convertToUserRole = (userType: string | UserRole): UserRole => {
  if (typeof userType === 'string') {
    const lowerCaseUserType = userType.toLowerCase();
    // Check if the lowercase string is a valid UserRole value
    if (Object.values(UserRole).includes(lowerCaseUserType as UserRole)) {
      return lowerCaseUserType as UserRole;
    }
    // Default to APPLICANT if the string doesn't match any UserRole value
    return UserRole.APPLICANT;
  }
  // If it's already a UserRole enum value, return it
  return userType;
};

export const profilesService = {
  async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userProfileRef = doc(db, "profiles", userId);
      await setDoc(userProfileRef, profileData, { merge: true });
      console.log(`User profile created for userId: ${userId}`);
    } catch (error) {
      console.error("Error creating user profile in Firestore:", error);
      throw new Error("Failed to create user profile.");
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userProfileRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(userProfileRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userType = convertToUserRole(data.userType);

        return {
          id: docSnap.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          photoURL: data.photoURL,
          userType,
          experience: Array.isArray(data.experience) ? data.experience : [],
          education: Array.isArray(data.education) ? data.education : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          ...data
        } as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<{ id: string; updatedDocument: Partial<UserProfile> }> {
    try {
      const dataToValidate = { ...profileData };
      
      // Handle null photoURL
      if (dataToValidate.photoURL === null) {
        dataToValidate.photoURL = undefined;
      }

      // Ensure arrays are properly handled
      if (dataToValidate.experience && !Array.isArray(dataToValidate.experience)) {
        dataToValidate.experience = [dataToValidate.experience];
      }
      
      if (dataToValidate.education && !Array.isArray(dataToValidate.education)) {
        dataToValidate.education = [dataToValidate.education];
      }

      // Handle userType conversion using helper function
      if (dataToValidate.userType) {
        dataToValidate.userType = convertToUserRole(dataToValidate.userType);
      }

      const validatedData = userProfileSchema.partial().parse(dataToValidate);
      
      // Create update payload with proper type handling
      const updatePayload: Partial<UserProfile> = {
        ...validatedData,
        photoURL: validatedData.photoURL === null ? undefined : validatedData.photoURL,
        experience: Array.isArray(validatedData.experience) ? validatedData.experience : [],
        education: Array.isArray(validatedData.education) ? validatedData.education : [],
        skills: Array.isArray(validatedData.skills) ? validatedData.skills : []
      };
      
      const updatedDocumentFromDb = await firebaseDatabaseService.update<UserProfile>(USERS_COLLECTION, userId, updatePayload);
      // Assuming updatedDocumentFromDb is of type (Partial<UserProfile> & { id: string })
      // We construct the object as per the defined return type
      return { id: updatedDocumentFromDb.id, updatedDocument: updatedDocumentFromDb as Partial<UserProfile> };

    } catch (error) {
      console.error(`Error updating user profile ${userId}:`, error);
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getApplicantProfiles(criteria?: {
    skills?: string[];
    location?: string;
    experience?: string;
  }): Promise<UserProfile[]> {
    const constraints: QueryConstraint[] = [
      where('userType', '==', UserRole.APPLICANT),
      where('isActive', '==', true)
    ];
    
    let profiles = await firebaseDatabaseService.query<UserProfile>(USERS_COLLECTION, constraints);
    
    if (criteria) {
      if (criteria.skills && criteria.skills.length > 0) {
        profiles = profiles.filter(profile => {
          if (!profile.skills) return false;
          return criteria.skills!.some(skill => profile.skills!.includes(skill));
        });
      }
      
      if (criteria.location) {
        const location = criteria.location.toLowerCase();
        profiles = profiles.filter(profile => {
          if (!profile.preferredLocation) return false;
          return profile.preferredLocation.toLowerCase().includes(location);
        });
      }
      
      if (criteria.experience) {
        profiles = profiles.filter(profile => {
          if (!profile.experience) return false;
          return profile.experience.includes(criteria.experience!);
        });
      }
    }
    
    return profiles;
  },

  async getRestaurantProfiles(criteria?: {
    location?: string;
    cuisineType?: string;
  }): Promise<UserProfile[]> {
    const constraints: QueryConstraint[] = [
      where('userType', '==', UserRole.RESTAURANT),
      where('isActive', '==', true)
    ];
    
    if (criteria?.cuisineType) {
      constraints.push(where('cuisineType', '==', criteria.cuisineType));
    }
    
    let profiles = await firebaseDatabaseService.query<UserProfile>(USERS_COLLECTION, constraints);
    
    if (criteria?.location) {
      const location = criteria.location.toLowerCase();
      profiles = profiles.filter(profile => {
        if (!profile.businessAddress) return false;
        return profile.businessAddress.toLowerCase().includes(location);
      });
    }
    
    return profiles;
  },

  async isProfileComplete(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return false;
    
    if (profile.userType === UserRole.APPLICANT) {
      return !!(profile.firstName && profile.lastName && profile.skills?.length && profile.experience?.length);
    } else if (profile.userType === UserRole.RESTAURANT) {
      return !!(profile.businessName && profile.businessAddress && profile.cuisineType);
    }
    return false;
  },

  async getAllUserProfiles(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const profiles: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const userType = convertToUserRole(data.userType);

        profiles.push({
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          photoURL: data.photoURL,
          userType,
          experience: Array.isArray(data.experience) ? data.experience : [],
          education: Array.isArray(data.education) ? data.education : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          ...data
        } as UserProfile);
      });
      
      return profiles;
    } catch (error) {
      console.error("Error fetching all user profiles:", error);
      throw error;
    }
  },

  subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): () => void {
    return firebaseDatabaseService.subscribeToDocument<UserProfile>(USERS_COLLECTION, userId, callback);
  }
};