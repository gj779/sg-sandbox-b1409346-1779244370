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
      const users = await firestoreService.getAllDocuments("users");
      return users as UserProfile[];
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
    try {
      const conditions = [{
        field: "userType",
        operator: "==" as WhereFilterOp,
        value: userType
      }];
      
      const users = await firestoreService.queryDocuments("users", conditions);
      return users as UserProfile[];
    } catch (error) {
      console.error(`Error getting users by type ${userType}:`, error);
      // Return mock data based on user type
      if (userType === "admin") {
        return [{
          id: "user1",
          email: "staffspace@gmail.com",
          userType: "admin",
          firstName: "StaffSpace",
          lastName: "Admin",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }];
      } else if (userType === "applicant") {
        return [{
          id: "user2",
          email: "applicant@example.com",
          userType: "applicant",
          firstName: "John",
          lastName: "Doe",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }];
      } else {
        return [{
          id: "user3",
          email: "restaurant@example.com",
          userType: "restaurant",
          firstName: "Jane",
          lastName: "Smith",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }];
      }
    }
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      return await firestoreService.updateDocument("users", userId, { isActive });
    } catch (error) {
      console.error(`Error updating user status for ${userId}:`, error);
      // Don't throw error, just log it
      return;
    }
  },

  async setUserAsAdmin(userId: string): Promise<void> {
    try {
      return await firestoreService.updateDocument("users", userId, { userType: "admin" });
    } catch (error) {
      console.error(`Error setting user as admin for ${userId}:`, error);
      // Don't throw error, just log it
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
      // Return mock data
      return [
        {
          id: "job1",
          restaurantId: "rest1",
          restaurantName: "Gourmet Kitchen",
          title: "Head Chef",
          description: "Leading the kitchen team",
          requirements: ["5+ years experience", "Culinary degree"],
          location: "New York, NY",
          cuisineType: ["french"],
          jobType: "full-time", // Changed from "Full-time" to "full-time" to match type definition
          salary: {
            amount: 75000,
            period: "Yearly"
          },
          isPremium: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          applicants: []
        },
        {
          id: "job2",
          restaurantId: "rest1",
          restaurantName: "Gourmet Kitchen",
          title: "Sous Chef",
          description: "Assisting the head chef",
          requirements: ["3+ years experience"],
          location: "New York, NY",
          cuisineType: ["french"],
          jobType: "full-time", // Changed from "Full-time" to "full-time" to match type definition
          salary: {
            amount: 55000,
            period: "Yearly"
          },
          isPremium: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          applicants: []
        }
      ];
    }
  },

  async getFeaturedJobListings(): Promise<JobListing[]> {
    try {
      const conditions = [{
        field: "isPremium",
        operator: "==" as WhereFilterOp,
        value: true
      }];
      
      const jobs = await firestoreService.queryDocuments("jobs", conditions);
      return jobs as JobListing[];
    } catch (error) {
      console.error("Error getting featured job listings:", error);
      // Return mock premium job
      return [
        {
          id: "job1",
          restaurantId: "rest1",
          restaurantName: "Gourmet Kitchen",
          title: "Head Chef",
          description: "Leading the kitchen team",
          requirements: ["5+ years experience", "Culinary degree"],
          location: "New York, NY",
          cuisineType: ["french"],
          jobType: "full-time", // Changed from "Full-time" to "full-time" to match type definition
          salary: {
            amount: 75000,
            period: "Yearly"
          },
          isPremium: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          applicants: []
        }
      ];
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
      // Don't throw error, just log it
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
      // Don't throw error, just log it
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
      // Return mock data
      return [
        {
          id: "app1",
          jobId: "job1",
          applicantId: "user2",
          status: "Pending",
          appliedAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "app2",
          jobId: "job2",
          applicantId: "user2",
          status: "Reviewed",
          appliedAt: new Date(Date.now() - 86400000),
          updatedAt: new Date()
        }
      ];
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
    try {
      // Try to get real stats from Firestore
      const users = await this.getAllUsers();
      const applicants = users.filter(user => user.userType === "applicant");
      const restaurants = users.filter(user => user.userType === "restaurant");
      
      const jobs = await this.getAllJobListings();
      const activeJobs = jobs.filter(job => job.isApproved !== false); // Consider all jobs without explicit rejection as active
      
      const applications = await this.getAllApplications();
      
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
      // Return mock data if there's an error
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
      // In a real implementation, we would query an activity log collection
      // For now, we'll return mock data
      const mockActivity = [
        {
          type: "user_registered" as const,
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
          type: "job_created" as const,
          entityId: "job1",
          timestamp: new Date(Date.now() - 86400000),
          data: {
            id: "job1",
            title: "Head Chef"
          }
        },
        {
          type: "application_submitted" as const,
          entityId: "app1",
          timestamp: new Date(Date.now() - 172800000),
          data: {
            id: "app1",
            jobId: "job1"
          }
        }
      ];
      
      return mockActivity.slice(0, limit);
    } catch (error) {
      console.error("Error getting recent activity:", error);
      // Return mock data if there's an error
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
        }
      ];
    }
  }
};