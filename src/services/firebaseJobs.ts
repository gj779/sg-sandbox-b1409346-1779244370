import { firestoreService } from "./firebaseFirestore";
import { v4 as uuidv4 } from "uuid";
import { WhereFilterOp } from 'firebase/firestore';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as limitTo,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface JobListing {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  cuisineType: string[];
  jobType: "full-time" | "part-time" | "contract" | "temporary" | "Full-time" | "Part-time" | "Temporary" | "Event" | "Seasonal";
  salary: {
    amount: number;
    period: "Hourly" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  };
  startDate?: Date;
  endDate?: Date;
  eventDate?: Date;
  applicationDeadline?: Date;
  requiredAvailability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  isPremium: boolean;
  isApproved?: boolean;
  isActive?: boolean; // Add this property to fix TypeScript errors
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  applicants: string[];
}

export interface JobListingInput {
  restaurantId: string;
  title: string;
  description: string;
  location: string;
  salary?: {
    amount: number;
    period: "Hourly" | "Daily" | "Weekly" | "Monthly" | "Yearly";
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
  async createJobListing(jobData: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      return await firestoreService.createDocument('jobs', jobData);
    } catch (error) {
      console.error('Error creating job listing:', error);
      throw error;
    }
  },
  
  // Get a job listing by ID
  async getJobListing(jobId: string): Promise<JobListing | null> {
    try {
      return await firestoreService.getDocument('jobs', jobId);
    } catch (error) {
      console.error(`Error getting job listing with ID: ${jobId}:`, error);
      throw error;
    }
  },
  
  // Get a job listing by ID (alias for getJobListing)
  async getJob(jobId: string): Promise<JobListing | null> {
    return this.getJobListing(jobId);
  },
  
  // Update a job listing
  async updateJobListing(jobId: string, updates: Partial<JobListing>): Promise<void> {
    try {
      await firestoreService.updateDocument('jobs', jobId, updates);
    } catch (error) {
      console.error(`Error updating job listing with ID: ${jobId}:`, error);
      throw error;
    }
  },
  
  // Update a job listing (alias for updateJobListing)
  async updateJob(jobId: string, updates: Partial<JobListing>): Promise<void> {
    return this.updateJobListing(jobId, updates);
  },
  
  // Delete a job listing
  async deleteJobListing(jobId: string): Promise<void> {
    try {
      await firestoreService.deleteDocument('jobs', jobId);
    } catch (error) {
      console.error(`Error deleting job listing with ID: ${jobId}:`, error);
      throw error;
    }
  },
  
  // Get all job listings for a restaurant
  async getJobListingsByRestaurant(restaurantId: string): Promise<JobListing[]> {
    try {
      const conditions = [{
        field: 'restaurantId',
        operator: '==' as WhereFilterOp,
        value: restaurantId
      }];
      
      return await firestoreService.queryDocuments('jobs', conditions);
    } catch (error) {
      console.error(`Error getting job listings for restaurant: ${restaurantId}:`, error);
      return [];
    }
  },
  
  // Get all active job listings
  async getActiveJobs(limit: number = 20): Promise<JobListing[]> {
    try {
      const conditions = [{
        field: 'isApproved',
        operator: '==' as WhereFilterOp,
        value: true
      }];
      
      return await firestoreService.queryDocuments('jobs', conditions, 'createdAt', 'desc', limit);
    } catch (error) {
      console.error('Error getting active job listings:', error);
      return [];
    }
  },
  
  // Get featured (premium) job listings
  async getFeaturedJobs(limit: number = 10): Promise<JobListing[]> {
    try {
      const conditions = [
        {
          field: 'isPremium',
          operator: '==' as WhereFilterOp,
          value: true
        },
        {
          field: 'isApproved',
          operator: '==' as WhereFilterOp,
          value: true
        }
      ];
      
      return await firestoreService.queryDocuments('jobs', conditions, 'createdAt', 'desc', limit);
    } catch (error) {
      console.error('Error getting featured job listings:', error);
      return [];
    }
  },
  
  // Search for jobs by various criteria
  async searchJobs(
    searchParams: {
      title?: string;
      location?: string;
      cuisineType?: string[];
      jobType?: string[];
      minSalary?: number;
    },
    limit: number = 20
  ): Promise<JobListing[]> {
    try {
      const activeJobs = await this.getActiveJobs(100);
      
      let filteredJobs = activeJobs;
      
      if (searchParams.title) {
        const titleLower = searchParams.title.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(titleLower)
        );
      }
      
      if (searchParams.location) {
        const locationLower = searchParams.location.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(locationLower)
        );
      }
      
      if (searchParams.cuisineType && searchParams.cuisineType.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          job.cuisineType.some(cuisine => 
            searchParams.cuisineType?.includes(cuisine)
          )
        );
      }
      
      if (searchParams.jobType && searchParams.jobType.length > 0) {
        filteredJobs = filteredJobs.filter(job => 
          searchParams.jobType?.includes(job.jobType)
        );
      }
      
      if (searchParams.minSalary) {
        filteredJobs = filteredJobs.filter(job => 
          job.salary && job.salary.amount >= searchParams.minSalary
        );
      }
      
      return filteredJobs.slice(0, limit);
    } catch (error) {
      console.error('Error searching job listings:', error);
      return [];
    }
  },
  
  // Add applicant to job
  async addApplicantToJob(jobId: string, applicantId: string): Promise<void> {
    try {
      const job = await this.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job with ID: ${jobId} not found`);
      }
      
      if (job.applicants.includes(applicantId)) {
        return;
      }
      
      const updatedApplicants = [...job.applicants, applicantId];
      
      await this.updateJob(jobId, { applicants: updatedApplicants });
    } catch (error) {
      console.error(`Error adding applicant ${applicantId} to job ${jobId}:`, error);
      throw error;
    }
  },

  // Get all job listings with optional filters
  async getAllJobs(filters?: {
    restaurantId?: string;
    location?: string;
    jobType?: string;
    isActive?: boolean;
    skills?: string[];
    searchTerm?: string;
  }): Promise<JobListing[]> {
    try {
      // Start with basic query
      let conditions: {
        field: string;
        operator: WhereFilterOp;
        value: any;
      }[] = [];
      
      // Add filters if provided
      if (filters) {
        if (filters.restaurantId) {
          conditions.push({
            field: 'restaurantId',
            operator: '==',
            value: filters.restaurantId
          });
        }
        
        if (filters.jobType) {
          conditions.push({
            field: 'jobType',
            operator: '==',
            value: filters.jobType
          });
        }
        
        if (filters.isActive !== undefined) {
          conditions.push({
            field: 'isApproved',
            operator: '==',
            value: filters.isActive
          });
        }
      }
      
      // Get initial results
      let results = await firestoreService.queryDocuments('jobs', conditions);
      
      // Apply client-side filters that can't be done in Firestore query
      if (filters) {
        // Filter by location (partial match)
        if (filters.location) {
          const locationLower = filters.location.toLowerCase();
          results = results.filter(job => 
            job.location.toLowerCase().includes(locationLower)
          );
        }
        
        // Filter by skills (array contains any)
        if (filters.skills && filters.skills.length > 0) {
          results = results.filter(job => 
            job.requirements.some(req => 
              filters.skills?.some(skill => 
                req.toLowerCase().includes(skill.toLowerCase())
              )
            )
          );
        }
        
        // Search term (search in title and description)
        if (filters.searchTerm) {
          const searchTermLower = filters.searchTerm.toLowerCase();
          results = results.filter(job => 
            job.title.toLowerCase().includes(searchTermLower) || 
            job.description.toLowerCase().includes(searchTermLower)
          );
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error getting job listings:', error);
      return [];
    }
  }
};