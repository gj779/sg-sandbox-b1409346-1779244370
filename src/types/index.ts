
import { Timestamp } from "firebase/firestore";

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
  email: string;
  userType: UserRole; // Replaced 'role' with 'userType' for consistency
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  photoURL?: string; // Added from User
  
  // Applicant-specific fields
  experience?: string[];
  skills?: string[];
  availability?: string[];
  hourlyRate?: number;
  resumeUrl?: string;
  preferredLocation?: string; // Added missing field
  education?: Education[]; // Added missing field
  preferences?: { // Added missing field
    jobTypes: string[];
    locations: string[];
    salary: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };

  // Restaurant-specific fields
  restaurantName?: string;
  contactName?: string;
  cuisineType?: string;
  restaurantSize?: string;
  description?: string;
  website?: string;
  businessName?: string; // Added missing field
  businessAddress?: string; // Added missing field

  // Common fields
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  profileComplete?: boolean; // Added from User
  
  // New fields from previous implementation
  isVerified?: boolean;
  notifications?: NotificationPreferences;
  privacySettings?: PrivacySettings;
}

export interface NotificationPreferences {
  // Notification preferences fields
}

export interface PrivacySettings {
  // Privacy settings fields
}

export interface FileCustomMetadata {
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  isPublic: boolean;
  tags: string[];
  description: string;
  category: string;
  uploadedBy: string;
  uploaderName?: string;
  sharedWith: string[];
  permissions: FilePermission[];
}

export interface FileMetadata extends FileCustomMetadata {
  path: string;
  url: string;
}

export interface FilePermission {
  userId: string;
  access: "read" | "write" | "admin";
}

export interface UploadProgress {
  taskId?: string;
  progress: number;
  state: "running" | "paused" | "success" | "error";
  error?: Error;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  contentType?: "text" | "image" | "file" | "video";
  fileURL?: string;
  fileName?: string;
  fileSize?: number;
  senderName?: string;
  senderPhotoURL?: string;
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read"
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
  createdAt: Date;
  participantProfiles?: Record<string, UserProfile>;
  unreadCounts?: Record<string, number>;
  typingUserIds?: string[];
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  restaurantId: string;
  restaurantName?: string; // Added for admin display
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
    amount?: number; // Added for backward compatibility
    period?: string; // Added for backward compatibility
  };
  requirements: string[];
  responsibilities: string[];
  type: string;
  jobType?: string; // Added for admin filtering
  status: "open" | "closed";
  isActive?: boolean; // Added for admin management
  isApproved?: boolean; // Added for admin approval workflow
  availability: Availability[];
  createdAt: Date;
  updatedAt: Date;
  cuisineTypes?: string[]; // Changed from cuisineType to cuisineTypes array
}

export interface Availability {
  dayOfWeek: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Resume {
  id: string;
  userId: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
  };
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  languages: Language[];
  references: Reference[];
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  isCurrentlyStudying: boolean;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  isCurrentlyWorking: boolean;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
}

export interface Language {
  name: string;
  language: string;
  proficiency: "basic" | "intermediate" | "fluent" | "native";
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
  resumeId: string;
  coverLetter?: string;
  createdAt: Date;
  updatedAt: Date;
}