
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

// AWS Region
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

// Initialize AWS clients
export const cognitoIdentityClient = new CognitoIdentityClient({ region: REGION });
export const dynamoDBClient = new DynamoDBClient({ region: REGION });
export const s3Client = new S3Client({ region: REGION });

// Configuration for Cognito User Pool
export const cognitoConfig = {
  userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || "",
  userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID || "",
  region: REGION,
};

// S3 bucket names
export const s3Config = {
  resumeBucket: process.env.NEXT_PUBLIC_AWS_S3_RESUME_BUCKET || "",
  profileImageBucket: process.env.NEXT_PUBLIC_AWS_S3_PROFILE_IMAGE_BUCKET || "",
};

// DynamoDB table names
export const dynamoDBConfig = {
  usersTable: process.env.NEXT_PUBLIC_AWS_DYNAMODB_USERS_TABLE || "",
  jobsTable: process.env.NEXT_PUBLIC_AWS_DYNAMODB_JOBS_TABLE || "",
  applicationsTable: process.env.NEXT_PUBLIC_AWS_DYNAMODB_APPLICATIONS_TABLE || "",
  messagesTable: process.env.NEXT_PUBLIC_AWS_DYNAMODB_MESSAGES_TABLE || "",
};
