
import { firestoreService } from "./firebaseFirestore";
import { v4 as uuidv4 } from "uuid";

export interface JobListing {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    rate: "hourly" | "yearly";
  };
  jobType: "full-time" | "part-time" | "contract" | "temporary";
  skills: string[];
  requirements: string[];
  benefits?: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface JobListingInput {
  restaurantId: string;
  title: string;
  description: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    rate: "hourly" | "yearly";
  };
  jobType: "full-time" | "part-time" | "contract" | "temporary";
  skills: string[];
  requirements: string[];
  benefits?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const firebaseJobsService = {
  // Create a new job listing
  async createJobListing(jobData: JobListingInput): Promise<JobListing> {
    const jobId = uuidv4();
    
    const jobListing: JobListing = {
      id: jobId,
      ...jobData,
      isActive: jobData.isActive !== undefined ? jobData.isActive : true,
      createdAt: null, // Will be set by Firestore
      updatedAt: null, // Will be set by Firestore
    };

    await firestoreService.createDocumentWithId("jobs", jobId, jobListing);
    
    // Get the created document to return with server timestamps
    const createdJob = await firestoreService.getDocument("jobs", jobId) as JobListing;
    return createdJob;
  },

  // Get a job listing by ID
  async getJobListing(jobId: string): Promise<JobListing | null> {
    return firestoreService.getDocument("jobs", jobId) as Promise<JobListing | null>;
  },

  // Update a job listing
  async updateJobListing(jobId: string, updates: Partial<JobListingInput>): Promise<JobListing | null> {
    await firestoreService.updateDocument("jobs", jobId, updates);
    
    // Get the updated document
    return firestoreService.getDocument("jobs", jobId) as Promise<JobListing | null>;
  },

  // Delete a job listing
  async deleteJobListing(jobId: string): Promise<void> {
    return firestoreService.deleteDocument("jobs", jobId);
  },

  // Get all job listings (with optional filtering)
  async getJobListings(filters?: {
    restaurantId?: string;
    location?: string;
    jobType?: string;
    isActive?: boolean;
    skills?: string[];
  }): Promise<JobListing[]> {
    const conditions = [];
    
    if (filters?.restaurantId) {
      conditions.push({
        field: "restaurantId",
        operator: "==",
        value: filters.restaurantId
      });
    }
    
    if (filters?.jobType) {
      conditions.push({
        field: "jobType",
        operator: "==",
        value: filters.jobType
      });
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push({
        field: "isActive",
        operator: "==",
        value: filters.isActive
      });
    }
    
    // Note: Firestore doesn't support direct text search like DynamoDB
    // For location and skills, we'll need to filter in memory or use a more complex query
    
    const jobs = await firestoreService.queryDocuments("jobs", conditions, "createdAt", "desc");
    
    // Apply additional filtering in memory
    let filteredJobs = jobs as JobListing[];
    
    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        filters.skills!.some(skill => job.skills.includes(skill))
      );
    }
    
    return filteredJobs;
  },

  // Get job listings by restaurant ID
  async getJobListingsByRestaurant(restaurantId: string): Promise<JobListing[]> {
    return this.getJobListings({ restaurantId });
  },

  // Search job listings
  async searchJobListings(searchTerm: string): Promise<JobListing[]> {
    // Firestore doesn't support full text search natively
    // We'll get all jobs and filter in memory (not efficient for large datasets)
    const allJobs = await firestoreService.getAllDocuments("jobs") as JobListing[];
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return allJobs.filter(job => 
      job.title.toLowerCase().includes(searchTermLower) || 
      job.description.toLowerCase().includes(searchTermLower)
    );
  }
};
