// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  phoneNumber?: string;
  userType: "applicant" | "restaurant" | "admin";
  createdAt: Date;
  updatedAt: Date;
  profileComplete?: boolean;
}

export interface Applicant extends User {
  userType: "applicant";
  resume?: Resume;
  skills: string[];
  experience: Experience[];
  availability: Availability[];
  preferences: {
    cuisineTypes: string[];
    jobTypes: string[];
    locationPreference?: string;
    radius?: number;
  };
  appliedJobs: string[];
  isPremium: boolean;
}

export interface Restaurant extends User {
  userType: "restaurant";
  businessName: string;
  businessAddress: string;
  businessDescription?: string;
  cuisineType: string[];
  listings: string[];
  isPremium: boolean;
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
  certifications: Certification[];
  languages: Language[];
  references?: Reference[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date;
  isCurrentlyStudying?: boolean;
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrentlyWorking?: boolean;
  description?: string;
  responsibilities?: string[];
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
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
  jobType: "Full-time" | "Part-time" | "Temporary" | "Event" | "Seasonal" | "full-time" | "part-time" | "contract" | "temporary";
  salary?: {
    amount: number;
    period: "Hourly" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  };
  startDate?: Date;
  endDate?: Date;
  eventDate?: Date;
  applicationDeadline?: Date;
  requiredAvailability?: Availability[];
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  applicants: string[];
}

export interface Availability {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;
  endTime: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  resumeId?: string;
  coverLetter?: string;
  status: "Pending" | "Reviewed" | "Shortlisted" | "Rejected" | "Hired";
  appliedAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "job_alert" | "application_update" | "message" | "system";
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
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
  };
  privacySettings: {
    profileVisibility: "Public" | "Registered Users" | "Private";
    contactInfoVisibility: "Public" | "Registered Users" | "Private";
  };
}