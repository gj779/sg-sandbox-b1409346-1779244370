import { useState, useCallback } from "react";
import { firebaseJobsService, JobListing, JobListingInput } from "@/services/firebaseJobs";
import { firebaseApplicationsService, JobApplication, JobApplicationInput } from "@/services/firebaseApplications";

// Hook for job listings
export function useFirebaseJobListings() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all job listings
  const fetchJobs = useCallback(async (filters?: {
    restaurantId?: string;
    location?: string;
    jobType?: string;
    isActive?: boolean;
    skills?: string[];
    searchTerm?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const jobListings = await firebaseJobsService.getAllJobs(filters);
      setJobs(jobListings);
      return jobListings;
    } catch (err: any) {
      setError(err.message || "Failed to fetch job listings");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single job listing
  const fetchJob = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const job = await firebaseJobsService.getJobListing(jobId);
      return job;
    } catch (err: any) {
      setError(err.message || "Failed to fetch job listing");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new job listing
  const createJob = useCallback(async (jobData: JobListingInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert JobListingInput to the format expected by createJobListing
      const adaptedJobData: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt'> = {
        restaurantId: jobData.restaurantId,
        restaurantName: '', // This would be filled from the restaurant profile
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements || [],
        location: jobData.location,
        cuisineType: [], // This would be filled from the restaurant profile
        jobType: jobData.jobType,
        salary: jobData.salary || { amount: 0, period: "Hourly" },
        isPremium: false,
        applicants: [],
        // Convert string dates to Date objects if present
        startDate: jobData.startDate ? new Date(jobData.startDate) : undefined,
        endDate: jobData.endDate ? new Date(jobData.endDate) : undefined,
      };
      
      const jobId = await firebaseJobsService.createJobListing(adaptedJobData);
      
      // Fetch the newly created job to add to state
      const newJob = await firebaseJobsService.getJobListing(jobId);
      
      if (newJob) {
        setJobs(prev => [...prev, newJob]);
      }
      
      return newJob;
    } catch (err: any) {
      setError(err.message || "Failed to create job listing");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a job listing
  const updateJob = useCallback(async (jobId: string, updates: Partial<JobListingInput>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert updates to the format expected by updateJobListing
      const adaptedUpdates: Partial<JobListing> = {
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.location && { location: updates.location }),
        ...(updates.jobType && { jobType: updates.jobType }),
        ...(updates.salary && { salary: updates.salary }),
        ...(updates.requirements && { requirements: updates.requirements }),
        ...(updates.startDate && { startDate: new Date(updates.startDate) }),
        ...(updates.endDate && { endDate: new Date(updates.endDate) }),
      };
      
      await firebaseJobsService.updateJobListing(jobId, adaptedUpdates);
      
      // Fetch the updated job to update state
      const updatedJob = await firebaseJobsService.getJobListing(jobId);
      
      if (updatedJob) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? updatedJob : job
        ));
      }
      
      return updatedJob;
    } catch (err: any) {
      setError(err.message || "Failed to update job listing");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a job listing
  const deleteJob = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await firebaseJobsService.deleteJobListing(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete job listing");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search job listings
  const searchJobs = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use getAllJobs with a searchTerm parameter
      const results = await firebaseJobsService.getAllJobs({ 
        searchTerm 
      });
      setJobs(results);
      return results;
    } catch (err: any) {
      setError(err.message || "Failed to search job listings");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    jobs,
    isLoading,
    error,
    fetchJobs,
    fetchJob,
    createJob,
    updateJob,
    deleteJob,
    searchJobs,
  };
}

// Hook for job applications
export function useFirebaseJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications by job ID
  const fetchApplicationsByJob = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const jobApplications = await firebaseApplicationsService.getApplicationsByJob(jobId);
      setApplications(jobApplications);
      return jobApplications;
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch applications by applicant ID
  const fetchApplicationsByApplicant = useCallback(async (applicantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const jobApplications = await firebaseApplicationsService.getApplicationsByApplicant(applicantId);
      setApplications(jobApplications);
      return jobApplications;
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch applications by restaurant ID
  const fetchApplicationsByRestaurant = useCallback(async (restaurantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const jobApplications = await firebaseApplicationsService.getApplicationsByRestaurant(restaurantId);
      setApplications(jobApplications);
      return jobApplications;
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new application
  const createApplication = useCallback(async (applicationData: JobApplicationInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the application ID from createApplication
      const applicationId = await firebaseApplicationsService.createApplication(applicationData);
      
      // Fetch the newly created application to add to state
      const newApplication = await firebaseApplicationsService.getApplication(applicationId);
      
      if (newApplication) {
        setApplications(prev => [...prev, newApplication]);
      }
      
      return newApplication;
    } catch (err: any) {
      setError(err.message || "Failed to create application");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update application status
  const updateApplicationStatus = useCallback(async (
    applicationId: string, 
    status: JobApplication["status"], 
    notes?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await firebaseApplicationsService.updateApplicationStatus(
        applicationId, 
        status, 
        notes
      );
      
      // Fetch the updated application to update state
      const updatedApplication = await firebaseApplicationsService.getApplication(applicationId);
      
      if (updatedApplication) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? updatedApplication : app
        ));
      }
      
      return updatedApplication;
    } catch (err: any) {
      setError(err.message || "Failed to update application status");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    applications,
    isLoading,
    error,
    fetchApplicationsByJob,
    fetchApplicationsByApplicant,
    fetchApplicationsByRestaurant,
    createApplication,
    updateApplicationStatus,
  };
}