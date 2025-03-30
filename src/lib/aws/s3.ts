
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Config } from "./config";

export const s3Service = {
  // Generate a pre-signed URL for uploading a file
  async getUploadUrl(bucket: string, key: string, contentType: string, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  // Generate a pre-signed URL for downloading a file
  async getDownloadUrl(bucket: string, key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  // Upload a file directly (server-side only)
  async uploadFile(bucket: string, key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    return s3Client.send(command);
  },

  // Delete a file
  async deleteFile(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return s3Client.send(command);
  },

  // List files in a directory
  async listFiles(bucket: string, prefix: string) {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  }
};

// Helper functions for common S3 operations
export const s3Helpers = {
  // Get a pre-signed URL for uploading a resume
  async getResumeUploadUrl(userId: string, fileName: string, contentType: string) {
    const key = `resumes/${userId}/${fileName}`;
    return s3Service.getUploadUrl(s3Config.resumeBucket, key, contentType);
  },

  // Get a pre-signed URL for downloading a resume
  async getResumeDownloadUrl(userId: string, fileName: string) {
    const key = `resumes/${userId}/${fileName}`;
    return s3Service.getDownloadUrl(s3Config.resumeBucket, key);
  },

  // Get a pre-signed URL for uploading a profile image
  async getProfileImageUploadUrl(userId: string, fileName: string, contentType: string) {
    const key = `profiles/${userId}/${fileName}`;
    return s3Service.getUploadUrl(s3Config.profileImageBucket, key, contentType);
  },

  // Get a pre-signed URL for downloading a profile image
  async getProfileImageDownloadUrl(userId: string, fileName: string) {
    const key = `profiles/${userId}/${fileName}`;
    return s3Service.getDownloadUrl(s3Config.profileImageBucket, key);
  }
};
