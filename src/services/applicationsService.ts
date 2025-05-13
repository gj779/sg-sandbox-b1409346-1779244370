
import { 
  where, 
  orderBy, 
  limit, 
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { firebaseDatabaseService } from './firebaseDatabase';
import { z } from 'zod';

// Define the Application schema for validation
export const applicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  applicantId: z.string().min(1, "Applicant ID is required"),
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  status: z.enum(["Pending", "Reviewed", "Shortlisted", "Rejected", "Withdrawn"]).default("Pending"),
  matchScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Define the Application type
export type Application = z.infer<typeof applicationSchema>;

// Collection path
const APPLICATIONS_COLLECTION = 'applications';

export const applicationsService = {
  /**
   * Create a new application
   * @param applicationData - Application data
   * @returns Promise with the created application
   */
  async createApplication(applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string; data: Application }> {
    try {
      // Validate application data
      const validatedData = applicationSchema.parse(applicationData);
      
      // Create the application
      return await firebaseDatabaseService.create<Application>(APPLICATIONS_COLLECTION, validatedData);
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get an application by ID
   * @param applicationId - Application ID
   * @returns Promise with the application data
   */
  async getApplicationById(applicationId: string): Promise<Application | null> {
    return await firebaseDatabaseService.getById<Application>(APPLICATIONS_COLLECTION, applicationId);
  },

  /**
   * Update an application
   * @param applicationId - Application ID
   * @param applicationData - Application data to update
   * @returns Promise with the updated application
   */
  async updateApplication(applicationId: string, applicationData: Partial<Application>): Promise<{ id: string; data: Partial<Application> }> {
    try {
      // Validate partial application data
      const validatedData = applicationSchema.partial().parse(applicationData);
      
      // Update the application
      return await firebaseDatabaseService.update<Application>(APPLICATIONS_COLLECTION, applicationId, validatedData);
    } catch (error) {
      console.error(`Error updating application ${applicationId}:`, error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to update application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete an application
   * @param applicationId - Application ID
   * @returns Promise<void>
   */
  async deleteApplication(applicationId: string): Promise<void> {
    return await firebaseDatabaseService.delete(APPLICATIONS_COLLECTION, applicationId);
  },

  /**
   * Get applications by job ID
   * @param jobId - Job ID
   * @returns Promise with an array of applications
   */
  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    const constraints: QueryConstraint[] = [
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    ];
    
    return await firebaseDatabaseService.query<Application>(APPLICATIONS_COLLECTION, constraints);
  },

  /**
   * Get applications by applicant ID
   * @param applicantId - Applicant ID
   * @returns Promise with an array of applications
   */
  async getApplicationsByApplicantId(applicantId: string): Promise<Application[]> {
    const constraints: QueryConstraint[] = [
      where('applicantId', '==', applicantId),
      orderBy('createdAt', 'desc')
    ];
    
    return await firebaseDatabaseService.query<Application>(APPLICATIONS_COLLECTION, constraints);
  },

  /**
   * Get applications by restaurant ID
   * @param restaurantId - Restaurant ID
   * @returns Promise with an array of applications
   */
  async getApplicationsByRestaurantId(restaurantId: string): Promise<Application[]> {
    const constraints: QueryConstraint[] = [
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    ];
    
    return await firebaseDatabaseService.query<Application>(APPLICATIONS_COLLECTION, constraints);
  },

  /**
   * Check if an applicant has already applied to a job
   * @param jobId - Job ID
   * @param applicantId - Applicant ID
   * @returns Promise<boolean>
   */
  async hasApplied(jobId: string, applicantId: string): Promise<boolean> {
    const constraints: QueryConstraint[] = [
      where('jobId', '==', jobId),
      where('applicantId', '==', applicantId),
      limit(1)
    ];
    
    const applications = await firebaseDatabaseService.query<Application>(APPLICATIONS_COLLECTION, constraints);
    return applications.length > 0;
  },

  /**
   * Subscribe to real-time updates for an application
   * @param applicationId - Application ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToApplication(applicationId: string, callback: (application: Application | null) => void): () => void {
    return firebaseDatabaseService.subscribeToDocument<Application>(APPLICATIONS_COLLECTION, applicationId, callback);
  },

  /**
   * Subscribe to real-time updates for a job's applications
   * @param jobId - Job ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToJobApplications(jobId: string, callback: (applications: Application[]) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    ];
    
    return firebaseDatabaseService.subscribeToQuery<Application>(APPLICATIONS_COLLECTION, constraints, callback);
  },

  /**
   * Subscribe to real-time updates for an applicant's applications
   * @param applicantId - Applicant ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToApplicantApplications(applicantId: string, callback: (applications: Application[]) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('applicantId', '==', applicantId),
      orderBy('createdAt', 'desc')
    ];
    
    return firebaseDatabaseService.subscribeToQuery<Application>(APPLICATIONS_COLLECTION, constraints, callback);
  }
};
