
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
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  preferredLocation?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  certifications?: string[];
  availability?: string[];
  userType?: UserRole;
  businessName?: string;
  businessAddress?: string;
  cuisineType?: string;
  profileComplete?: boolean;
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
  uploadedBy?: string;
  uploaderName?: string;
  sharedWith?: string[];
  permissions?: FilePermission[];
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
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  restaurantId: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  responsibilities: string[];
  type: string;
  status: "open" | "closed";
  availability: Availability[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Resume {
  id: string;
  userId: string;
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
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface Language {
  name: string;
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
