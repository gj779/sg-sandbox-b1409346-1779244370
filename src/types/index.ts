
// User Types
export enum UserRole {
  APPLICANT = "applicant",
  RESTAURANT = "restaurant",
  ADMIN = "admin"
}

export interface User {
  id: string;
  email: string;
  name: string; // Typically concatenation of firstName and lastName, or displayName from Firebase
  photoURL?: string;
  phoneNumber?: string;
  userType: UserRole;
  createdAt?: Date; // Make optional as it might not always be present on client-side objects
  updatedAt?: Date; // Make optional
  profileComplete?: boolean;
  isActive?: boolean; // Added from profilesService schema
}

// Rest of the file remains unchanged
[Previous content after User interface remains exactly the same...]
