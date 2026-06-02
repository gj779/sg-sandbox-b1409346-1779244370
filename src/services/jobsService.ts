import { 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  QueryConstraint,
  DocumentData,
  increment
} from 'firebase/firestore';
import { firebaseDatabaseService } from './firebaseDatabase';
import { z } from 'zod';

// Define the Job schema for validation
export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  restaurantName: z.string().min(1, "Restaurant name is required"),
  jobType: z.enum(["Full-time", "Part-time", "Contract", "Temporary", "Internship"]),
  salary: z.object({
    amount: z.number().optional(),
    period: z.enum(["Hourly", "Daily", "Weekly", "Monthly", "Yearly"]).optional(),
    range: z.object({
      min: z.number(),
      max: z.number()
    }).optional()
  }).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  applicationDeadline: z.date().optional(),
  isActive: z.boolean().default(true),
  isApproved: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  views: z.number().default(0),
  applicationsCount: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Define the Job type
export type Job = z.infer<typeof jobSchema>;

// Collection path
const JOBS_COLLECTION = 'jobs';

export const jobsService = {
  /**
   * Create a new job listing
   * @param jobData - Job data
   * @returns Promise with the created job
   */
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string; data: Job }> {
    try {
      // Validate job data
      const validatedData = jobSchema.parse(jobData);
      
      // Create the job
      return await firebaseDatabaseService.create<Job>(JOBS_COLLECTION, validatedData);
    } catch (error) {
      console.error('Error creating job:', error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get a job by ID
   * @param jobId - Job ID
   * @returns Promise with the job data
   */
  async getJobById(jobId: string): Promise<Job | null> {
    return await firebaseDatabaseService.getById<Job>(JOBS_COLLECTION, jobId);
  },

  /**
   * Update a job
   * @param jobId - Job ID
   * @param jobData - Job data to update
   * @returns Promise with the updated job
   */
  async updateJob(jobId: string, jobData: Partial<Job>): Promise<{ id: string; data: Partial<Job> }> {
    try {
      // Validate partial job data
      const validatedData = jobSchema.partial().parse(jobData);
      
      // Update the job
      return await firebaseDatabaseService.update<Job>(JOBS_COLLECTION, jobId, validatedData);
    } catch (error) {
      console.error(`Error updating job ${jobId}:`, error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to update job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete a job
   * @param jobId - Job ID
   * @returns Promise<void>
   */
  async deleteJob(jobId: string): Promise<void> {
    return await firebaseDatabaseService.delete(JOBS_COLLECTION, jobId);
  },

  /**
   * Get all active jobs
   * @param lastVisible - Last visible document for pagination
   * @param pageSize - Number of jobs to fetch
   * @returns Promise with an array of jobs
   */
  async getActiveJobs(lastVisible?: DocumentData, pageSize: number = 10): Promise<Job[]> {
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    ];
    
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    return await firebaseDatabaseService.query<Job>(JOBS_COLLECTION, constraints);
  },

  /**
   * Get jobs by restaurant ID
   * @param restaurantId - Restaurant ID
   * @returns Promise with an array of jobs
   */
  async getJobsByRestaurantId(restaurantId: string): Promise<Job[]> {
    const constraints: QueryConstraint[] = [
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    ];
    
    return await firebaseDatabaseService.query<Job>(JOBS_COLLECTION, constraints);
  },

  /**
   * Search jobs by criteria
   * @param criteria - Search criteria
   * @returns Promise with an array of jobs
   */
  async searchJobs(criteria: {
    keyword?: string;
    location?: string;
    jobType?: string;
    experience?: string;
    salary?: {
      min?: number;
      max?: number;
    };
  }): Promise<Job[]> {
    // Start with base constraints for active and approved jobs
    const constraints: QueryConstraint[] = [
      where('isActive', '==', true),
      where('isApproved', '==', true)
    ];
    
    // Add job type filter if provided
    if (criteria.jobType) {
      constraints.push(where('jobType', '==', criteria.jobType));
    }
    
    // Add experience filter if provided
    if (criteria.experience) {
      constraints.push(where('experience', '==', criteria.experience));
    }
    
    // Get all jobs that match the constraints
    let jobs = await firebaseDatabaseService.query<Job>(JOBS_COLLECTION, constraints);
    
    // Apply client-side filtering for keyword and location
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(keyword) || 
        job.description.toLowerCase().includes(keyword) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(keyword)))
      );
    }
    
    if (criteria.location) {
      const location = criteria.location.toLowerCase();
      jobs = jobs.filter(job => job.location.toLowerCase().includes(location));
    }
    
    // Apply salary filter if provided
    if (criteria.salary) {
      if (criteria.salary.min !== undefined) {
        jobs = jobs.filter(job => {
          if (!job.salary || !job.salary.amount) return false;
          return job.salary.amount >= (criteria.salary?.min || 0);
        });
      }
      
      if (criteria.salary.max !== undefined) {
        jobs = jobs.filter(job => {
          if (!job.salary || !job.salary.amount) return false;
          return job.salary.amount <= (criteria.salary?.max || Infinity);
        });
      }
    }
    
    return jobs;
  },

  /**
   * Increment job views atomically
   * @param jobId - Job ID
   * @returns Promise<void>
   */
  async incrementJobViews(jobId: string): Promise<void> {
    // Use Firestore's atomic increment to prevent race conditions
    await firebaseDatabaseService.update<Job>(JOBS_COLLECTION, jobId, { 
      views: increment(1) as any 
    });
  },

  /**
   * Subscribe to real-time updates for a job
   * @param jobId - Job ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToJob(jobId: string, callback: (job: Job | null) => void): () => void {
    return firebaseDatabaseService.subscribeToDocument<Job>(JOBS_COLLECTION, jobId, callback);
  },

  /**
   * Subscribe to real-time updates for a restaurant's jobs
   * @param restaurantId - Restaurant ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToRestaurantJobs(restaurantId: string, callback: (jobs: Job[]) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    ];
    
    return firebaseDatabaseService.subscribeToQuery<Job>(JOBS_COLLECTION, constraints, callback);
  }
};
