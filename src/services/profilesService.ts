
import { 
  where, 
  orderBy, 
  limit, 
  QueryConstraint,
  DocumentData,
  collection,
  query,
  getDocs
} from 'firebase/firestore';
import { firebaseDatabaseService } from './firebaseDatabase';
import { db } from "@/lib/firebase"; // Import db directly
import { z } from 'zod';
import { UserProfile } from "@/types"; // Ensure UserProfile is imported

// Define the UserProfile schema for validation
export const userProfileSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email format"),
  userType: z.enum(["applicant", "restaurant", "admin"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal("")).nullable(), // Allow empty string or null
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  
  // Applicant specific fields
  skills: z.array(z.string()).optional(),
  experience: z.array(z.string()).optional(), // Changed to string array to match UserProfile type
  availability: z.array(z.string()).optional(),
  preferredLocation: z.string().optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
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

export const profilesService = {
  /**
   * Get a user profile by ID
   * @param userId - User ID
   * @returns Promise with the user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await firebaseDatabaseService.getById<UserProfile>(USERS_COLLECTION, userId);
  },

  /**
   * Update a user profile
   * @param userId - User ID
   * @param profileData - Profile data to update
   * @returns Promise with the updated profile
   */
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<{ id: string; data: Partial<UserProfile> }> {
    try {
      const dataToValidate = { ...profileData };
      
      if (dataToValidate.photoURL === null) {
        dataToValidate.photoURL = undefined;
      }

      // Ensure experience is an array if it's provided
      if (dataToValidate.experience && !Array.isArray(dataToValidate.experience)) {
        dataToValidate.experience = [dataToValidate.experience];
      }

      const validatedData = userProfileSchema.partial().parse(dataToValidate);
      
      const updatePayload: Partial<UserProfile> = {
        ...validatedData,
        photoURL: validatedData.photoURL === null ? undefined : validatedData.photoURL,
      };
      
      return await firebaseDatabaseService.update<UserProfile>(USERS_COLLECTION, userId, updatePayload);
    } catch (error) {
      console.error(`Error updating user profile ${userId}:`, error);
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get applicant profiles
   * @param criteria - Search criteria
   * @returns Promise with an array of applicant profiles
   */
  async getApplicantProfiles(criteria?: {
    skills?: string[];
    location?: string;
    experience?: string;
  }): Promise<UserProfile[]> {
    const constraints: QueryConstraint[] = [
      where('userType', '==', 'applicant'),
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

  /**
   * Get restaurant profiles
   * @param criteria - Search criteria
   * @returns Promise with an array of restaurant profiles
   */
  async getRestaurantProfiles(criteria?: {
    location?: string;
    cuisineType?: string;
  }): Promise<UserProfile[]> {
    const constraints: QueryConstraint[] = [
      where('userType', '==', 'restaurant'),
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

  /**
   * Check if a profile is complete
   * @param userId - User ID
   * @returns Promise<boolean>
   */
  async isProfileComplete(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return false;
    
    if (profile.userType === "applicant") {
      return !!(profile.firstName && profile.lastName && profile.skills?.length && profile.experience?.length);
    } else if (profile.userType === "restaurant") {
      return !!(profile.businessName && profile.businessAddress && profile.cuisineType);
    }
    return false;
  },

  /**
   * Get all user profiles
   * @returns Promise with an array of user profiles
   */
  async getAllUserProfiles(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      const profiles: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        profiles.push({
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          photoURL: data.photoURL,
          userType: data.userType,
          experience: data.experience || [], // Ensure experience is always an array
          skills: data.skills || [],
          ...data
        } as UserProfile);
      });
      
      return profiles;
    } catch (error) {
      console.error("Error fetching all user profiles:", error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time updates for a user profile
   * @param userId - User ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): () => void {
    return firebaseDatabaseService.subscribeToDocument<UserProfile>(USERS_COLLECTION, userId, callback);
  }
};
