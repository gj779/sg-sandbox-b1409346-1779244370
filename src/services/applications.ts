
import { dynamoDBService } from "@/lib/aws/dynamodb";
import { dynamoDBConfig } from "@/lib/aws/config";
import { v4 as uuidv4 } from "uuid";

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  restaurantId: string;
  status: "pending" | "reviewed" | "interviewing" | "accepted" | "rejected";
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationInput {
  jobId: string;
  applicantId: string;
  restaurantId: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export const applicationsService = {
  // Create a new job application
  async createApplication(applicationData: JobApplicationInput): Promise<JobApplication> {
    const now = new Date().toISOString();
    
    const application: JobApplication = {
      id: uuidv4(),
      ...applicationData,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await dynamoDBService.putItem(dynamoDBConfig.applicationsTable, application);
    return application;
  },

  // Get an application by ID
  async getApplication(applicationId: string): Promise<JobApplication | null> {
    return dynamoDBService.getItem(dynamoDBConfig.applicationsTable, { id: applicationId }) as Promise<JobApplication | null>;
  },

  // Update an application
  async updateApplication(applicationId: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
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
      dynamoDBConfig.applicationsTable,
      { id: applicationId },
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobApplication | null>;
  },

  // Delete an application
  async deleteApplication(applicationId: string): Promise<void> {
    await dynamoDBService.deleteItem(dynamoDBConfig.applicationsTable, { id: applicationId });
  },

  // Get applications by job ID
  async getApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    const filterExpression = "#jobId = :jobId";
    const expressionAttributeValues = { ":jobId": jobId };
    const expressionAttributeNames = { "#jobId": "jobId" };
    
    return dynamoDBService.scan(
      dynamoDBConfig.applicationsTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobApplication[]>;
  },

  // Get applications by applicant ID
  async getApplicationsByApplicant(applicantId: string): Promise<JobApplication[]> {
    const filterExpression = "#applicantId = :applicantId";
    const expressionAttributeValues = { ":applicantId": applicantId };
    const expressionAttributeNames = { "#applicantId": "applicantId" };
    
    return dynamoDBService.scan(
      dynamoDBConfig.applicationsTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobApplication[]>;
  },

  // Get applications by restaurant ID
  async getApplicationsByRestaurant(restaurantId: string): Promise<JobApplication[]> {
    const filterExpression = "#restaurantId = :restaurantId";
    const expressionAttributeValues = { ":restaurantId": restaurantId };
    const expressionAttributeNames = { "#restaurantId": "restaurantId" };
    
    return dynamoDBService.scan(
      dynamoDBConfig.applicationsTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobApplication[]>;
  },

  // Get applications by status
  async getApplicationsByStatus(status: JobApplication["status"]): Promise<JobApplication[]> {
    const filterExpression = "#status = :status";
    const expressionAttributeValues = { ":status": status };
    const expressionAttributeNames = { "#status": "status" };
    
    return dynamoDBService.scan(
      dynamoDBConfig.applicationsTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<JobApplication[]>;
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: JobApplication["status"], notes?: string): Promise<JobApplication | null> {
    const updates: Partial<JobApplication> = { status };
    
    if (notes) {
      updates.notes = notes;
    }
    
    return this.updateApplication(applicationId, updates);
  }
};
