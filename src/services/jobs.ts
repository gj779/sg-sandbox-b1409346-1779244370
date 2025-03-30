
import { dynamoDBService } from "@/lib/aws/dynamodb";
import { dynamoDBConfig } from "@/lib/aws/config";
import { v4 as uuidv4 } from "uuid";

export interface JobListing {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    rate: "hourly" | "yearly";
  };
  jobType: "full-time" | "part-time" | "contract" | "temporary";
  skills: string[];
  requirements: string[];
  benefits?: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobListingInput {
  restaurantId: string;
  title: string;
  description: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    rate: "hourly" | "yearly";
  };
  jobType: "full-time" | "part-time" | "contract" | "temporary";
  skills: string[];
  requirements: string[];
  benefits?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const jobsService = {
  // Create a new job listing
  async createJobListing(jobData: JobListingInput): Promise<JobListing> {
    const now = new Date().toISOString();
    
    const jobListing: JobListing = {
      id: uuidv4(),
      ...jobData,
      isActive: jobData.isActive !== undefined ? jobData.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    await dynamoDBService.putItem(dynamoDBConfig.jobsTable, jobListing);
    return jobListing;
  },

  // Get a job listing by ID
  async getJobListing(jobId: string): Promise<JobListing | null> {
    return dynamoDBService.getItem(dynamoDBConfig.jobsTable, { id: jobId }) as Promise<JobListing | null>;
  },

  // Update a job listing
  async updateJobListing(jobId: string, updates: Partial<JobListingInput>): Promise<JobListing | null> {
    // Create update expression and attribute values
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id") { // Don't update primary key
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    // Add updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();
    expressionAttributeNames["#updatedAt"] = "updatedAt";

    const updateExpression = `SET ${updateExpressions.join(", ")}`;

    return dynamoDBService.updateItem(
      dynamoDBConfig.jobsTable,
      { id: jobId },
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobListing | null>;
  },

  // Delete a job listing
  async deleteJobListing(jobId: string): Promise<void> {
    await dynamoDBService.deleteItem(dynamoDBConfig.jobsTable, { id: jobId });
  },

  // Get all job listings (with optional filtering)
  async getJobListings(filters?: {
    restaurantId?: string;
    location?: string;
    jobType?: string;
    isActive?: boolean;
    skills?: string[];
  }): Promise<JobListing[]> {
    if (!filters) {
      return dynamoDBService.scan(dynamoDBConfig.jobsTable) as Promise<JobListing[]>;
    }

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};
    
    if (filters.restaurantId) {
      filterExpressions.push("#restaurantId = :restaurantId");
      expressionAttributeValues[":restaurantId"] = filters.restaurantId;
      expressionAttributeNames["#restaurantId"] = "restaurantId";
    }
    
    if (filters.location) {
      filterExpressions.push("contains(#location, :location)");
      expressionAttributeValues[":location"] = filters.location;
      expressionAttributeNames["#location"] = "location";
    }
    
    if (filters.jobType) {
      filterExpressions.push("#jobType = :jobType");
      expressionAttributeValues[":jobType"] = filters.jobType;
      expressionAttributeNames["#jobType"] = "jobType";
    }
    
    if (filters.isActive !== undefined) {
      filterExpressions.push("#isActive = :isActive");
      expressionAttributeValues[":isActive"] = filters.isActive;
      expressionAttributeNames["#isActive"] = "isActive";
    }
    
    // For skills, we need to check if any of the required skills are in the job's skills array
    if (filters.skills && filters.skills.length > 0) {
      const skillExpressions = filters.skills.map((skill, index) => {
        expressionAttributeValues[`:skill${index}`] = skill;
        return `contains(#skills, :skill${index})`;
      });
      
      filterExpressions.push(`(${skillExpressions.join(" OR ")})`);
      expressionAttributeNames["#skills"] = "skills";
    }
    
    const filterExpression = filterExpressions.length > 0 
      ? filterExpressions.join(" AND ")
      : undefined;
    
    return dynamoDBService.scan(
      dynamoDBConfig.jobsTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobListing[]>;
  },

  // Get job listings by restaurant ID
  async getJobListingsByRestaurant(restaurantId: string): Promise<JobListing[]> {
    return this.getJobListings({ restaurantId });
  },

  // Search job listings
  async searchJobListings(searchTerm: string): Promise<JobListing[]> {
    // Search in title and description
    const filterExpression = "contains(#title, :searchTerm) OR contains(#description, :searchTerm)";
    const expressionAttributeValues = {
      ":searchTerm": searchTerm
    };
    const expressionAttributeNames = {
      "#title": "title",
      "#description": "description"
    };
    
    return dynamoDBService.scan(
      dynamoDBConfig.jobsTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobListing[]>;
  }
};
