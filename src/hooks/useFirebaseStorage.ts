
import { useState, useCallback } from "react";
import { firebaseStorageService } from "@/services/firebaseStorage";
import type { FileMetadata, FileCustomMetadata, UploadProgress } from "@/types";

export function useFirebaseStorage(userId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: UploadProgress }>({});

  const uploadFile = useCallback(
    async (
      file: File,
      path: string,
      metadata: Partial<FileCustomMetadata> = {},
      onProgress?: (progress: UploadProgress) => void
    ) => {
      setIsLoading(true);
      setError(null);
      const fileId = `${Date.now()}-${file.name}`;

      try {
        const fileMetadata = await firebaseStorageService.uploadFile(
          file,
          path,
          {
            ...metadata,
            uploadedBy: userId,
            uploaderName: metadata.uploaderName || userId,
            isPublic: metadata.isPublic || false
          },
          (progress) => {
            const progressWithId = {
              ...progress,
              taskId: fileId
            };
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: progressWithId
            }));
            if (onProgress) {
              onProgress(progressWithId);
            }
          }
        );
        return fileMetadata;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const deleteFile = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await firebaseStorageService.deleteFile(path);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Delete failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFileMetadata = useCallback(
    async (path: string, updates: Partial<FileCustomMetadata>) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedMetadata = await firebaseStorageService.updateFileMetadata(path, {
          ...updates,
          uploadedBy: userId
        });
        return updatedMetadata;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Metadata update failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const listFiles = useCallback(async (path: string = "/") => {
    setIsLoading(true);
    setError(null);

    try {
      const files = await firebaseStorageService.listFiles(path);
      return files;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("List files failed");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkFileAccess = useCallback(
    async (path: string) => {
      try {
        return await firebaseStorageService.checkFileAccess(path, userId);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Access check failed");
        setError(error);
        throw error;
      }
    },
    [userId]
  );

  return {
    uploadFile,
    deleteFile,
    updateFileMetadata,
    listFiles,
    checkFileAccess,
    isLoading,
    error,
    uploadProgress
  };
}
