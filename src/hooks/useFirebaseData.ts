
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
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const jobListings = await firebaseJobsService.getJobListings(filters);
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
      const newJob = await firebaseJobsService.createJobListing(jobData);
      setJobs(prev => [...prev, newJob]);
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
      const updatedJob = await firebaseJobsService.updateJobListing(jobId, updates);
      
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
      const results = await firebaseJobsService.searchJobListings(searchTerm);
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
      const newApplication = await firebaseApplicationsService.createApplication(applicationData);
      setApplications(prev => [...prev, newApplication]);
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
      const updatedApplication = await firebaseApplicationsService.updateApplicationStatus(
        applicationId, 
        status, 
        notes
      );
      
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
