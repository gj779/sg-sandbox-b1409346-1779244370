import { firestoreService } from "./firebaseFirestore";
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { UserProfile } from "./firebaseAuth";
import { JobListing } from "./firebaseJobs";
import { JobApplication } from "./firebaseApplications";

// Admin-specific operations for the StaffSpace platform
export const firebaseAdminService = {
  // User Management
  async getAllUsers(): Promise<UserProfile[]> {
    return firestoreService.getAllDocuments("users") as Promise<UserProfile[]>;
  },

  async getUsersByType(userType: "applicant" | "restaurant" | "admin"): Promise<UserProfile[]> {
    const conditions = [{
      field: "userType",
      operator: "==",
      value: userType
    }];
    
    return firestoreService.queryDocuments("users", conditions) as Promise<UserProfile[]>;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    return firestoreService.updateDocument("users", userId, { isActive });
  },

  async setUserAsAdmin(userId: string): Promise<void> {
    return firestoreService.updateDocument("users", userId, { userType: "admin" });
  },

  // Job Listings Management
  async getAllJobListings(): Promise<JobListing[]> {
    return firestoreService.getAllDocuments("jobs") as Promise<JobListing[]>;
  },

  async getFeaturedJobListings(): Promise<JobListing[]> {
    const conditions = [{
      field: "isPremium",
      operator: "==",
      value: true
    }];
    
    return firestoreService.queryDocuments("jobs", conditions) as Promise<JobListing[]>;
  },

  async approveJobListing(jobId: string): Promise<void> {
    return firestoreService.updateDocument("jobs", jobId, { 
      isApproved: true,
      approvedAt: new Date()
    });
  },

  async rejectJobListing(jobId: string, reason: string): Promise<void> {
    return firestoreService.updateDocument("jobs", jobId, { 
      isApproved: false,
      rejectionReason: reason
    });
  },

  // Applications Management
  async getAllApplications(): Promise<JobApplication[]> {
    return firestoreService.getAllDocuments("applications") as Promise<JobApplication[]>;
  },

  // Analytics
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalApplicants: number;
    totalRestaurants: number;
    totalJobs: number;
    totalApplications: number;
    activeJobs: number;
  }> {
    const [users, jobs, applications] = await Promise.all([
      this.getAllUsers(),
      this.getAllJobListings(),
      this.getAllApplications()
    ]);

    const applicants = users.filter(user => user.userType === "applicant");
    const restaurants = users.filter(user => user.userType === "restaurant");
    const activeJobs = jobs.filter(job => job.isActive);

    return {
      totalUsers: users.length,
      totalApplicants: applicants.length,
      totalRestaurants: restaurants.length,
      totalJobs: jobs.length,
      totalApplications: applications.length,
      activeJobs: activeJobs.length
    };
  },

  async getRecentActivity(limit: number = 10): Promise<Array<{
    type: "user_registered" | "job_created" | "application_submitted";
    entityId: string;
    timestamp: any;
    data: any;
  }>> {
    // Get recent users
    const recentUsers = await firestoreService.queryDocuments(
      "users", 
      [], 
      "createdAt", 
      "desc", 
      limit
    );
    
    // Get recent jobs
    const recentJobs = await firestoreService.queryDocuments(
      "jobs", 
      [], 
      "createdAt", 
      "desc", 
      limit
    );
    
    // Get recent applications
    const recentApplications = await firestoreService.queryDocuments(
      "applications", 
      [], 
      "createdAt", 
      "desc", 
      limit
    );
    
    // Combine and sort by timestamp
    const allActivity = [
      ...recentUsers.map(user => ({
        type: "user_registered" as const,
        entityId: user.id,
        timestamp: user.createdAt,
        data: user
      })),
      ...recentJobs.map(job => ({
        type: "job_created" as const,
        entityId: job.id,
        timestamp: job.createdAt,
        data: job
      })),
      ...recentApplications.map(app => ({
        type: "application_submitted" as const,
        entityId: app.id,
        timestamp: app.createdAt,
        data: app
      }))
    ];
    
    // Sort by timestamp (newest first) and limit
    return allActivity
      .sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }
};
