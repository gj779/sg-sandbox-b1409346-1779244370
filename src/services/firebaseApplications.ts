import { firestoreService } from "./firebaseFirestore";
import { v4 as uuidv4 } from "uuid";
import { WhereFilterOp } from "firebase/firestore";

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  resumeId?: string;
  coverLetter?: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Hired';
  appliedAt: Date;
  updatedAt: Date;
  interviewDate?: Date;
  notes?: string;
  feedback?: string;
}

export interface JobApplicationInput {
  jobId: string;
  applicantId: string;
  resumeId?: string;
  coverLetter?: string;
}

export const firebaseApplicationsService = {
  // Create a new job application
  async createApplication(applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'status'>): Promise<string> {
    try {
      // Set default status to Pending
      const data = {
        ...applicationData,
        status: 'Pending' as const
      };
      
      return await firestoreService.createDocument('applications', data);
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  },
  
  // Get a job application by ID
  async getApplication(applicationId: string): Promise<JobApplication | null> {
    try {
      return await firestoreService.getDocument('applications', applicationId);
    } catch (error) {
      console.error(`Error getting job application with ID: ${applicationId}:`, error);
      throw error;
    }
  },
  
  // Update a job application
  async updateApplication(applicationId: string, updates: Partial<JobApplication>): Promise<void> {
    try {
      await firestoreService.updateDocument('applications', applicationId, updates);
    } catch (error) {
      console.error(`Error updating job application with ID: ${applicationId}:`, error);
      throw error;
    }
  },
  
  // Delete a job application
  async deleteApplication(applicationId: string): Promise<void> {
    try {
      await firestoreService.deleteDocument('applications', applicationId);
    } catch (error) {
      console.error(`Error deleting job application with ID: ${applicationId}:`, error);
      throw error;
    }
  },
  
  // Get all applications for a job
  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    try {
      const conditions = [{
        field: 'jobId',
        operator: '==' as WhereFilterOp,
        value: jobId
      }];
      
      return await firestoreService.queryDocuments('applications', conditions);
    } catch (error) {
      console.error(`Error getting applications for job: ${jobId}:`, error);
      return [];
    }
  },
  
  // Get all applications by an applicant
  async getApplicationsByApplicant(applicantId: string): Promise<JobApplication[]> {
    try {
      const conditions = [{
        field: 'applicantId',
        operator: '==' as WhereFilterOp,
        value: applicantId
      }];
      
      return await firestoreService.queryDocuments('applications', conditions);
    } catch (error) {
      console.error(`Error getting applications for applicant: ${applicantId}:`, error);
      return [];
    }
  },
  
  // Get all applications for a restaurant
  async getApplicationsByRestaurant(restaurantId: string): Promise<JobApplication[]> {
    try {
      // This is more complex as we need to:
      // 1. Get all jobs for the restaurant
      // 2. Get all applications for those jobs
      
      // For now, we'll return a mock implementation
      return [];
    } catch (error) {
      console.error(`Error getting applications for restaurant: ${restaurantId}:`, error);
      return [];
    }
  },
  
  // Update application status
  async updateApplicationStatus(applicationId: string, status: JobApplication['status'], notes?: string): Promise<void> {
    try {
      const updates: Partial<JobApplication> = {
        status,
        updatedAt: new Date()
      };
      
      if (notes) {
        updates.notes = notes;
      }
      
      await this.updateApplication(applicationId, updates);
    } catch (error) {
      console.error(`Error updating status for application: ${applicationId}:`, error);
      throw error;
    }
  },
  
  // Schedule an interview
  async scheduleInterview(applicationId: string, interviewDate: Date): Promise<void> {
    try {
      await this.updateApplication(applicationId, {
        interviewDate,
        status: 'Shortlisted'
      });
    } catch (error) {
      console.error(`Error scheduling interview for application: ${applicationId}:`, error);
      throw error;
    }
  },
  
  // Get upcoming interviews for applicant
  async getUpcomingInterviewsForApplicant(applicantId: string): Promise<JobApplication[]> {
    try {
      const now = new Date();
      
      const applications = await this.getApplicationsByApplicant(applicantId);
      
      // Filter for applications with upcoming interviews
      return applications.filter(app => 
        app.interviewDate && app.interviewDate > now
      );
    } catch (error) {
      console.error(`Error getting upcoming interviews for applicant: ${applicantId}:`, error);
      return [];
    }
  },
  
  // Get upcoming interviews for restaurant
  async getUpcomingInterviewsForRestaurant(restaurantId: string): Promise<JobApplication[]> {
    try {
      const now = new Date();
      
      const applications = await this.getApplicationsByRestaurant(restaurantId);
      
      // Filter for applications with upcoming interviews
      return applications.filter(app => 
        app.interviewDate && app.interviewDate > now
      );
    } catch (error) {
      console.error(`Error getting upcoming interviews for restaurant: ${restaurantId}:`, error);
      return [];
    }
  }
};