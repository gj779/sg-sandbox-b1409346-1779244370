
import { 
  where, 
  orderBy, 
  limit, 
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { firebaseDatabaseService } from './firebaseDatabase';
import { z } from 'zod';
import { UserProfile } from '@/hooks/useFirebaseAuth';

// Define the UserProfile schema for validation
export const userProfileSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email format"),
  userType: z.enum(["applicant", "restaurant", "admin"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  photoURL: z.string().url().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  
  // Applicant specific fields
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  availability: z.array(z.string()).optional(),
  preferredLocation: z.string().optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  jobPreferences: z.array(z.string()).optional(),
  location: z.string().optional(),
  
  // Restaurant specific fields
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
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
      // Validate partial profile data
      const validatedData = userProfileSchema.partial().parse(profileData);
      
      // Update the profile
      return await firebaseDatabaseService.update<UserProfile>(USERS_COLLECTION, userId, validatedData);
    } catch (error) {
      console.error(`Error updating user profile ${userId}:`, error);
      if (error instanceof z.ZodError) {
        // Format validation errors
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
    // Start with base constraints for applicant profiles
    const constraints: QueryConstraint[] = [
      where('userType', '==', 'applicant'),
      where('isActive', '==', true)
    ];
    
    // Get all applicant profiles that match the constraints
    let profiles = await firebaseDatabaseService.query<UserProfile>(USERS_COLLECTION, constraints);
    
    // Apply client-side filtering for criteria
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
        profiles = profiles.filter(profile => profile.experience === criteria.experience);
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
    // Start with base constraints for restaurant profiles
    const constraints: QueryConstraint[] = [
      where('userType', '==', 'restaurant'),
      where('isActive', '==', true)
    ];
    
    // Add cuisine type filter if provided
    if (criteria?.cuisineType) {
      constraints.push(where('cuisineType', '==', criteria.cuisineType));
    }
    
    // Get all restaurant profiles that match the constraints
    let profiles = await firebaseDatabaseService.query<UserProfile>(USERS_COLLECTION, constraints);
    
    // Apply client-side filtering for location
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
    
    if (profile.userType === 'applicant') {
      // Check required fields for applicant profiles
      return !!(
        profile.firstName &&
        profile.lastName &&
        profile.email &&
        profile.skills &&
        profile.skills.length > 0 &&
        profile.experience &&
        profile.preferredLocation
      );
    } else if (profile.userType === 'restaurant') {
      // Check required fields for restaurant profiles
      return !!(
        profile.firstName &&
        profile.lastName &&
        profile.email &&
        profile.businessName &&
        profile.businessAddress &&
        profile.cuisineType
      );
    }
    
    return false;
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
