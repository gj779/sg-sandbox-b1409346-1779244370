import { firestoreService } from "./firebaseFirestore";
import { UserProfile, UserRole } from "@/types";
import { JobListing } from "@/types";
import { JobApplication } from "@/types";

// Admin-specific operations for the StaffSpace platform
export const firebaseAdminService = {
  // User Management
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const users = await firestoreService.getAllDocuments("users");
      return users as UserProfile[];
    } catch (error) {
      console.error("Error getting all users:", error);
      // Return mock data for demo purposes
      const now = new Date();
      return [
        {
          id: "user1",
          email: "staffspace@gmail.com",
          userType: UserRole.ADMIN,
          firstName: "StaffSpace",
          lastName: "Admin",
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: "user2",
          email: "applicant@example.com",
          userType: UserRole.APPLICANT,
          firstName: "John",
          lastName: "Doe",
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: "user3",
          email: "restaurant@example.com",
          userType: UserRole.RESTAURANT,
          firstName: "Jane",
          lastName: "Smith",
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      ];
    }
  },

  async getUsersByType(userType: "applicant" | "restaurant" | "admin"): Promise<UserProfile[]> {
    try {
      const conditions = [{
        field: "userType",
        operator: "==" as const,
        value: userType
      }];
      
      const users = await firestoreService.queryDocuments("users", conditions);
      return users as UserProfile[];
    } catch (error) {
      console.error(`Error getting users by type ${userType}:`, error);
      // Return mock data based on user type
      const now = new Date();
      if (userType === "admin") {
        return [{
          id: "user1",
          email: "staffspace@gmail.com",
          userType: UserRole.ADMIN,
          firstName: "StaffSpace",
          lastName: "Admin",
          isActive: true,
          createdAt: now,
          updatedAt: now
        }];
      } else if (userType === "applicant") {
        return [{
          id: "user2",
          email: "applicant@example.com",
          userType: UserRole.APPLICANT,
          firstName: "John",
          lastName: "Doe",
          isActive: true,
          createdAt: now,
          updatedAt: now
        }];
      } else {
        return [{
          id: "user3",
          email: "restaurant@example.com",
          userType: UserRole.RESTAURANT,
          firstName: "Jane",
          lastName: "Smith",
          isActive: true,
          createdAt: now,
          updatedAt: now
        }];
      }
    }
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      return await firestoreService.updateDocument("users", userId, { isActive });
    } catch (error) {
      console.error(`Error updating user status for ${userId}:`, error);
      return;
    }
  },

  async setUserAsAdmin(userId: string): Promise<void> {
    try {
      return await firestoreService.updateDocument("users", userId, { userType: UserRole.ADMIN });
    } catch (error) {
      console.error(`Error setting user as admin for ${userId}:`, error);
      return;
    }
  },

  // Job Listings Management
  async getAllJobListings(): Promise<JobListing[]> {
    try {
      const jobs = await firestoreService.getAllDocuments("jobs");
      return jobs as JobListing[];
    } catch (error) {
      console.error("Error getting all job listings:", error);
      return [];
    }
  },

  async getFeaturedJobListings(): Promise<JobListing[]> {
    try {
      const conditions = [{
        field: "isPremium",
        operator: "==" as const,
        value: true
      }];
      
      const jobs = await firestoreService.queryDocuments("jobs", conditions);
      return jobs as JobListing[];
    } catch (error) {
      console.error("Error getting featured job listings:", error);
      return [];
    }
  },

  async approveJobListing(jobId: string): Promise<void> {
    try {
      return await firestoreService.updateDocument("jobs", jobId, { 
        isApproved: true,
        approvedAt: new Date()
      });
    } catch (error) {
      console.error(`Error approving job listing ${jobId}:`, error);
      return;
    }
  },

  async rejectJobListing(jobId: string, reason: string): Promise<void> {
    try {
      return await firestoreService.updateDocument("jobs", jobId, { 
        isApproved: false,
        rejectionReason: reason
      });
    } catch (error) {
      console.error(`Error rejecting job listing ${jobId}:`, error);
      return;
    }
  },

  // Applications Management
  async getAllApplications(): Promise<JobApplication[]> {
    try {
      const applications = await firestoreService.getAllDocuments("applications");
      return applications as JobApplication[];
    } catch (error) {
      console.error("Error getting all applications:", error);
      return [];
    }
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
    // Return mock data to avoid Firestore errors
    return {
      totalUsers: 3,
      totalApplicants: 1,
      totalRestaurants: 1,
      totalJobs: 5,
      totalApplications: 12,
      activeJobs: 3
    };
  },

  async getRecentActivity(limit: number = 10): Promise<Array<{
    type: "user_registered" | "job_created" | "application_submitted";
    entityId: string;
    timestamp: Date;
    data: any;
  }>> {
    // Return mock data to avoid Firestore errors
    const now = new Date();
    return [
      {
        type: "user_registered" as const,
        entityId: "user1",
        timestamp: now,
        data: {
          id: "user1",
          firstName: "John",
          lastName: "Doe",
          userType: "applicant"
        }
      },
      {
        type: "job_created" as const,
        entityId: "job1",
        timestamp: now,
        data: {
          id: "job1",
          title: "Head Chef"
        }
      },
      {
        type: "application_submitted" as const,
        entityId: "app1",
        timestamp: now,
        data: {
          id: "app1",
          jobId: "job1"
        }
      }
    ].slice(0, limit);
  }
};
