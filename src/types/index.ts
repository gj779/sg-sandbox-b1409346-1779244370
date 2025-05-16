// User Types
export interface User {
  id: string;
  email: string;
  name: string; // Typically concatenation of firstName and lastName, or displayName from Firebase
  photoURL?: string;
  phoneNumber?: string;
  userType: "applicant" | "restaurant" | "admin";
  createdAt?: Date; // Make optional as it might not always be present on client-side objects
  updatedAt?: Date; // Make optional
  profileComplete?: boolean;
  isActive?: boolean; // Added from profilesService schema
}

export interface ApplicantSpecificProfile {
  resume?: Resume;
  skills?: string[] | string; // Allow string for form input, array for storage
  experience?: Experience[] | string; // Allow string for form input (e.g. "1-3 years"), array for detailed storage
  availability?: Availability[] | string[]; // Allow string array for form input
  preferences?: {
    cuisineTypes?: string[];
    jobTypes?: string[];
    locationPreference?: string;
    radius?: number;
  };
  appliedJobs?: string[];
  isPremium?: boolean;
  bio?: string;
  education?: Education[] | string; // Allow string for form input
  jobPreferences?: string[];
  preferredLocation?: string;
  location?: string; // General location field
}

export interface RestaurantSpecificProfile {
  businessName?: string;
  businessAddress?: string;
  businessDescription?: string; // Can map to 'bio' from UserProfile for consistency
  cuisineType?: string[] | string; // Allow string for form input
  listings?: string[];
  isPremium?: boolean; // Assuming restaurants can also be premium
  hiringPositions?: string[];
  jobTypes?: string[]; // e.g., Full-time, Part-time
  benefits?: string;
}

// Comprehensive UserProfile combining User and specific fields
export interface UserProfile extends User, ApplicantSpecificProfile, RestaurantSpecificProfile {
  // All fields from User, ApplicantSpecificProfile, and RestaurantSpecificProfile are merged.
  // Optional fields remain optional.
  // Ensure no direct field conflicts, or resolve them (e.g. 'name' vs 'firstName'/'lastName')
  // 'name' from User can be derived or stored as displayName.
  // For forms, often individual fields like firstName, lastName are preferred.
  firstName?: string; // Explicitly add if not covered by 'name'
  lastName?: string;  // Explicitly add
}


// Resume Types
export interface Resume {
  id: string;
  userId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications?: Certification[];
  languages?: Language[];
  references?: Reference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date | string; // Allow string for form input
  endDate?: Date | string;   // Allow string for form input
  isCurrentlyStudying?: boolean;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: Date | string; // Allow string for form input
  endDate?: Date | string;   // Allow string for form input
  isCurrentlyWorking?: boolean;
  description?: string;
  responsibilities?: string[];
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date | string;
  expirationDate?: Date | string;
  credentialID?: string;
  credentialURL?: string;
}

export interface Language {
  language: string;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Fluent" | "Native";
}

export interface Reference {
  name: string;
  company: string;
  position: string;
  email?: string;
  phone?: string;
  relationship: string;
}

// Job Listing Types
export interface JobListing {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  cuisineType: string[];
  jobType: "Full-time" | "Part-time" | "Temporary" | "Event" | "Seasonal" | "full-time" | "part-time" | "contract"; // Added 'contract'
  salary?: {
    amount: number;
    period: "Hourly" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  };
  startDate?: Date | string;
  endDate?: Date | string;
  eventDate?: Date | string;
  applicationDeadline?: Date | string;
  requiredAvailability?: Availability[];
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  applicants: string[]; // Array of applicant User IDs
  status?: "open" | "closed" | "filled"; // Added status
  createdBy?: string; // User ID of restaurant user who created it
}

export interface Availability {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  restaurantId: string; // Added for easier querying/filtering
  resumeId?: string;
  coverLetter?: string;
  status: "Pending" | "Reviewed" | "Shortlisted" | "Interviewing" | "Offered" | "Rejected" | "Hired" | "Withdrawn"; // Expanded statuses
  appliedAt: Date;
  updatedAt: Date;
  notes?: string; // Notes by restaurant or applicant
}

// Notification Types
export interface Notification {
  id: string;
  userId: string; // User to whom the notification belongs
  title: string;
  message: string;
  type: "job_alert" | "application_update" | "message" | "system" | "interview_scheduled" | "interview_reminder";
  relatedId?: string; // e.g., jobId, applicationId, conversationId
  isRead: boolean;
  createdAt: Date;
  link?: string; // Optional link for navigation
}

// Settings Types
export interface UserSettings {
  userId: string;
  language: string;
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    jobAlerts: boolean;
    applicationUpdates: boolean;
    messages: boolean;
    interviewUpdates?: boolean; // Added
  };
  privacySettings: {
    profileVisibility: "Public" | "Registered Users" | "Private";
    contactInfoVisibility: "Public" | "Registered Users" | "Private";
    resumeVisibility?: "Public" | "Employers Applied To" | "Private"; // Added
  };
}

// Message and Conversation Types
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "sending"; // Added "sending"

export interface MessageReaction {
  [emoji: string]: string[]; // emoji: [userId1, userId2]
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  content: string;
  contentType: "text" | "image" | "file" | "emoji" | "system" | "voice"; // Added "voice"
  fileURL?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  timestamp: Date; // Or Firestore Timestamp
  status: MessageStatus;
  reactions?: MessageReaction;
  isEdited?: boolean;
  deletedFor?: string[];
  readBy?: string[]; // User IDs who have read this message
  replyToMessageId?: string; // For threaded replies
  metadata?: Record<string, any>; // For additional data like link previews
}

export interface Conversation {
  id: string;
  participants: string[];
  participantProfiles?: UserProfile[];
  lastMessage?: Message | null;
  unreadCounts: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
  typingUserIds?: string[];
  theme?: string;
  isGroupChat?: boolean;
  groupName?: string;
  groupAvatar?: string;
  archivedBy?: string[];
  mutedBy?: { [userId: string]: Date | boolean };
  pinnedBy?: string[];
  adminIds?: string[]; // For group chats
  description?: string; // For group chats
}

// Job interface (if different from JobListing, or can be merged)
// Assuming Job is similar to JobListing for now. If it's a simpler version, define separately.
export type Job = JobListing;

export interface UploadProgress {
  progress: number;
  status: "error" | "running" | "paused" | "success" | "canceled"; // Added "canceled"
  error?: Error | null;
  downloadURL?: string | null;
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  taskId: string; // To identify and manage specific uploads
}

// Add after UploadProgress interface
export interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  fullPath: string;
  path: string;
  downloadURL: string;
  customMetadata: FileCustomMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileCustomMetadata {
  uploadedBy: string;
  uploaderName: string;
  description?: string;
  tags?: string[];
  sharedWith?: { [userId: string]: FilePermission };
  permissions?: { [userId: string]: FilePermission };
  isPublic?: boolean;
}

export type FilePermission = "read" | "write";