import { firestoreService } from "./firebaseFirestore";
import { v4 as uuidv4 } from "uuid";

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  restaurantId: string;
  status: "pending" | "reviewed" | "interviewing" | "accepted" | "rejected";
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface JobApplicationInput {
  jobId: string;
  applicantId: string;
  restaurantId: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export const firebaseApplicationsService = {
  // Create a new job application
  async createApplication(applicationData: JobApplicationInput): Promise<JobApplication> {
    const applicationId = uuidv4();
    
    const application: JobApplication = {
      id: applicationId,
      ...applicationData,
      status: "pending",
      createdAt: null, // Will be set by Firestore
      updatedAt: null, // Will be set by Firestore
    };

    await firestoreService.createDocumentWithId("applications", applicationId, application);
    
    // Get the created document to return with server timestamps
    const createdApplication = await firestoreService.getDocument("applications", applicationId) as JobApplication;
    return createdApplication;
  },

  // Get an application by ID
  async getApplication(applicationId: string): Promise<JobApplication | null> {
    return firestoreService.getDocument("applications", applicationId) as Promise<JobApplication | null>;
  },

  // Update an application
  async updateApplication(applicationId: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
    await firestoreService.updateDocument("applications", applicationId, updates);
    
    // Get the updated document
    return firestoreService.getDocument("applications", applicationId) as Promise<JobApplication | null>;
  },

  // Delete an application
  async deleteApplication(applicationId: string): Promise<void> {
    return firestoreService.deleteDocument("applications", applicationId);
  },

  // Get applications by job ID
  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    const conditions = [{
      field: "jobId",
      operator: "==",
      value: jobId
    }];
    
    return firestoreService.queryDocuments("applications", conditions, "createdAt", "desc") as Promise<JobApplication[]>;
  },

  // Get applications by applicant ID
  async getApplicationsByApplicant(applicantId: string): Promise<JobApplication[]> {
    const conditions = [{
      field: "applicantId",
      operator: "==",
      value: applicantId
    }];
    
    return firestoreService.queryDocuments("applications", conditions, "createdAt", "desc") as Promise<JobApplication[]>;
  },

  // Get applications by restaurant ID
  async getApplicationsByRestaurant(restaurantId: string): Promise<JobApplication[]> {
    const conditions = [{
      field: "restaurantId",
      operator: "==",
      value: restaurantId
    }];
    
    return firestoreService.queryDocuments("applications", conditions, "createdAt", "desc") as Promise<JobApplication[]>;
  },

  // Get applications by status
  async getApplicationsByStatus(status: JobApplication["status"]): Promise<JobApplication[]> {
    const conditions = [{
      field: "status",
      operator: "==",
      value: status
    }];
    
    return firestoreService.queryDocuments("applications", conditions, "createdAt", "desc") as Promise<JobApplication[]>;
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: JobApplication["status"], notes?: string): Promise<JobApplication | null> {
    const updates: Partial<JobApplication> = { status };
    
    if (notes) {
      updates.notes = notes;
    }
    
    return this.updateApplication(applicationId, updates);
  }
};