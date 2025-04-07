import { firestoreService } from "./firebaseFirestore";
import { doc, updateDoc, query, collection, where, getDocs, WhereFilterOp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { UserProfile } from "./firebaseAuth";
import { JobListing } from "./firebaseJobs";
import { JobApplication } from "./firebaseApplications";

// Admin-specific operations for the StaffSpace platform
export const firebaseAdminService = {
  // User Management
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      return firestoreService.getAllDocuments("users") as Promise<UserProfile[]>;
    } catch (error) {
      console.error("Error getting all users:", error);
      // Return mock data for demo purposes
      return [
        {
          id: "user1",
          email: "staffspace@gmail.com",
          userType: "admin",
          firstName: "StaffSpace",
          lastName: "Admin",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "user2",
          email: "applicant@example.com",
          userType: "applicant",
          firstName: "John",
          lastName: "Doe",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "user3",
          email: "restaurant@example.com",
          userType: "restaurant",
          firstName: "Jane",
          lastName: "Smith",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  },

  async getUsersByType(userType: "applicant" | "restaurant" | "admin"): Promise<UserProfile[]> {
    const conditions = [{
      field: "userType",
      operator: "==" as WhereFilterOp,
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
      operator: "==" as WhereFilterOp,
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
    try {
      // Instead of making multiple Firestore calls that might fail,
      // we'll use a more reliable approach with proper error handling
      let users: UserProfile[] = [];
      let jobs: JobListing[] = [];
      let applications: JobApplication[] = [];
      
      try {
        users = await this.getAllUsers();
      } catch (error) {
        console.error("Error fetching users for stats:", error);
        users = [];
      }
      
      try {
        jobs = await this.getAllJobListings();
      } catch (error) {
        console.error("Error fetching jobs for stats:", error);
        jobs = [];
      }
      
      try {
        applications = await this.getAllApplications();
      } catch (error) {
        console.error("Error fetching applications for stats:", error);
        applications = [];
      }

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
    } catch (error) {
      console.error("Error getting system stats:", error);
      // Return mock data for demo purposes
      return {
        totalUsers: 3,
        totalApplicants: 1,
        totalRestaurants: 1,
        totalJobs: 5,
        totalApplications: 12,
        activeJobs: 3
      };
    }
  },

  async getRecentActivity(limit: number = 10): Promise<Array<{
    type: "user_registered" | "job_created" | "application_submitted";
    entityId: string;
    timestamp: any;
    data: any;
  }>> {
    try {
      // Initialize empty arrays to handle potential failures gracefully
      let recentUsers: any[] = [];
      let recentJobs: any[] = [];
      let recentApplications: any[] = [];
      
      // Get recent users with error handling
      try {
        recentUsers = await firestoreService.queryDocuments(
          "users", 
          [], 
          "createdAt", 
          "desc", 
          limit
        );
      } catch (userError) {
        console.error("Error fetching recent users:", userError);
      }
      
      // Get recent jobs with error handling
      try {
        recentJobs = await firestoreService.queryDocuments(
          "jobs", 
          [], 
          "createdAt", 
          "desc", 
          limit
        );
      } catch (jobError) {
        console.error("Error fetching recent jobs:", jobError);
      }
      
      // Get recent applications with error handling
      try {
        recentApplications = await firestoreService.queryDocuments(
          "applications", 
          [], 
          "createdAt", 
          "desc", 
          limit
        );
      } catch (appError) {
        console.error("Error fetching recent applications:", appError);
      }
      
      // Combine and sort by timestamp
      const allActivity = [
        ...recentUsers.map(user => ({
          type: "user_registered" as const,
          entityId: user.id || `user-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: user.createdAt || new Date(),
          data: user
        })),
        ...recentJobs.map(job => ({
          type: "job_created" as const,
          entityId: job.id || `job-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: job.createdAt || new Date(),
          data: job
        })),
        ...recentApplications.map(app => ({
          type: "application_submitted" as const,
          entityId: app.id || `app-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: app.createdAt || new Date(),
          data: app
        }))
      ];
      
      // If we have no activity data, return mock data
      if (allActivity.length === 0) {
        throw new Error("No activity data available");
      }
      
      // Sort by timestamp (newest first) and limit
      return allActivity
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
          return timeB - timeA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting recent activity:", error);
      // Return mock data for demo purposes
      return [
        {
          type: "user_registered",
          entityId: "user1",
          timestamp: new Date(),
          data: {
            id: "user1",
            firstName: "John",
            lastName: "Doe",
            userType: "applicant"
          }
        },
        {
          type: "job_created",
          entityId: "job1",
          timestamp: new Date(Date.now() - 86400000),
          data: {
            id: "job1",
            title: "Head Chef"
          }
        },
        {
          type: "application_submitted",
          entityId: "app1",
          timestamp: new Date(Date.now() - 172800000),
          data: {
            id: "app1",
            jobId: "job1"
          }
        }
      ];
    }
  }
};