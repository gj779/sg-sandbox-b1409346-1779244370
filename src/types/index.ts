
// User Types
export enum UserRole {
  APPLICANT = "applicant",
  RESTAURANT = "restaurant",
  ADMIN = "admin"
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  phoneNumber?: string;
  userType: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  profileComplete?: boolean;
  isActive?: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  certifications?: string[];
  availability?: string[];
  preferences?: {
    jobTypes?: string[];
    locations?: string[];
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
}

export interface FileCustomMetadata {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
  category?: string;
}
