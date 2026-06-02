import { useState, useEffect, useCallback } from "react";
import { applicationsService } from "@/services/applicationsService";
import { jobsService } from "@/services/jobsService";
import { profilesService } from "@/services/profilesService";
import { JobListing, JobApplication, UserProfile } from "@/types";

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
      // Use searchJobs if filters are provided, otherwise get active jobs
      let jobListings: JobListing[];
      
      if (filters?.restaurantId) {
        jobListings = await jobsService.getJobsByRestaurantId(filters.restaurantId);
      } else if (filters?.searchTerm || filters?.location || filters?.jobType) {
        jobListings = await jobsService.searchJobs({
          keyword: filters.searchTerm,
          location: filters.location,
          jobType: filters.jobType
        });
      } else {
        jobListings = await jobsService.getActiveJobs();
      }
      
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
      const job = await jobsService.getJobById(jobId);
      return job;
    } catch (err: any) {
      setError(err.message || "Failed to fetch job listing");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new job listing
  const createJob = useCallback(async (jobData: Partial<JobListing>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await jobsService.createJob(jobData as any);
      
      // Fetch the newly created job to add to state
      const newJob = await jobsService.getJobById(result.id);
      
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
  const updateJob = useCallback(async (jobId: string, updates: Partial<JobListing>) => {
    setIsLoading(true);
    setError(null);

    try {
      await jobsService.updateJob(jobId, updates);
      
      // Fetch the updated job to update state
      const updatedJob = await jobsService.getJobById(jobId);
      
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
      await jobsService.deleteJob(jobId);
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
      const results = await jobsService.searchJobs({ 
        keyword: searchTerm 
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
      const jobApplications = await applicationsService.getApplicationsByJobId(jobId);
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
      const jobApplications = await applicationsService.getApplicationsByApplicantId(applicantId);
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
      const jobApplications = await applicationsService.getApplicationsByRestaurantId(restaurantId);
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
  const createApplication = useCallback(async (applicationData: Partial<JobApplication>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await applicationsService.createApplication(applicationData as any);
      
      // Fetch the newly created application to add to state
      const newApplication = await applicationsService.getApplicationById(result.id);
      
      if (newApplication) {
        setApplications(prev => [...prev, { ...newApplication, id: result.id }]);
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
      await applicationsService.updateApplication(applicationId, { status, notes });
      
      // Fetch the updated application to update state
      const updatedApplication = await applicationsService.getApplicationById(applicationId);
      
      if (updatedApplication) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...updatedApplication, id: applicationId } : app
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