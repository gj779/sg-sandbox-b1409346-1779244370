
import { useState, useCallback } from "react";
import { s3Helpers } from "@/lib/aws/s3";

export function useStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Upload a resume file
  const uploadResume = useCallback(async (
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get a pre-signed URL for uploading
      const uploadUrl = await s3Helpers.getResumeUploadUrl(
        userId,
        file.name,
        file.type
      );

      // Upload the file using fetch
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Get the download URL
      const downloadUrl = await s3Helpers.getResumeDownloadUrl(userId, file.name);
      
      setIsUploading(false);
      setProgress(100);
      
      return downloadUrl;
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Upload failed");
      throw err;
    }
  }, []);

  // Upload a profile image
  const uploadProfileImage = useCallback(async (
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get a pre-signed URL for uploading
      const uploadUrl = await s3Helpers.getProfileImageUploadUrl(
        userId,
        file.name,
        file.type
      );

      // Upload the file using fetch
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Get the download URL
      const downloadUrl = await s3Helpers.getProfileImageDownloadUrl(userId, file.name);
      
      setIsUploading(false);
      setProgress(100);
      
      return downloadUrl;
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || "Upload failed");
      throw err;
    }
  }, []);

  return {
    isUploading,
    progress,
    error,
    uploadResume,
    uploadProfileImage,
  };
}
