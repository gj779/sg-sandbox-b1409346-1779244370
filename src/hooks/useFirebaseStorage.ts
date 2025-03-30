
import { useState, useCallback } from "react";
import { storageHelpers } from "@/services/firebaseStorage";

export function useFirebaseStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Upload a resume file
  const uploadResume = useCallback(async (
    userId: string,
    file: File
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const downloadUrl = await storageHelpers.uploadResume(
        userId,
        file,
        (progress) => setProgress(progress)
      );
      
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
    file: File
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const downloadUrl = await storageHelpers.uploadProfileImage(
        userId,
        file,
        (progress) => setProgress(progress)
      );
      
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
