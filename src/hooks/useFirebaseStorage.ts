import { useState, useCallback, useEffect } from "react";
import {
  firebaseStorageService, // Import the service instance
  FileMetadata,
  FileCustomMetadata,
} from "@/services/firebaseStorage";
import { UploadProgress } from "@/types"; // Assuming UploadProgress is correctly defined in types
import { useFirebaseAuth } from "./useFirebaseAuth";

export function useFirebaseStorage(directoryPathProp?: string) {
  const { user } = useFirebaseAuth(); // Corrected to useFirebaseAuth
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [progress, setProgress] = useState(0); // Removed as progress is per-file

  const getDirectoryPath = useCallback(() => {
    return directoryPathProp || (user ? `documents/${user.uid}/` : "documents/public/");
  }, [directoryPathProp, user]);

  /*
  // Temporarily commented out as storageHelpers is not defined
  // Upload a resume file
  const uploadResume = useCallback(async (
    userId: string,
    file: File
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // const downloadUrl = await storageHelpers.uploadResume(
      //   userId,
      //   file,
      //   (progress) => setProgress(progress) // setProgress is not defined here
      // );
      
      setIsLoading(false);
      // return downloadUrl;
      return ""; // Placeholder
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Upload failed");
      throw err;
    }
  }, []);

  // Upload a profile image
  const uploadProfileImage = useCallback(async (
    userId: string,
    file: File
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // const downloadUrl = await storageHelpers.uploadProfileImage(
      //   userId,
      //   file,
      //   (progress) => setProgress(progress) // setProgress is not defined here
      // );
      
      setIsLoading(false);
      // return downloadUrl;
      return ""; // Placeholder
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "Upload failed");
      throw err;
    }
  }, []);
  */

  const uploadFile = useCallback(async (
    file: File,
    customMetadata: Partial<FileCustomMetadata> = {},
    onProgress?: (progress: UploadProgress) => void, // Matched type from firebaseStorageService
    userIdOverride?: string // For cases where the file owner might be different from the logged-in user
  ): Promise<FileMetadata> => {
    setIsLoading(true);
    setError(null);
    const ownerIdToUse = userIdOverride || user?.uid;
    if (!ownerIdToUse) {
      const err = new Error("User ID is required for upload.");
      setError(err.message);
      setIsLoading(false);
      throw err;
    }

    const filePath = `${getDirectoryPath()}${file.name}`;
    const metaWithOwner: FileCustomMetadata = {
      ...customMetadata,
      ownerId: ownerIdToUse,
      uploaderId: user?.uid, // Logged in user performing the upload
      uploaderName: user?.displayName || user?.email || "Unknown Uploader",
    };

    try {
      // Call the method on the imported service instance
      const uploadedFileMeta = await firebaseStorageService.uploadFile(filePath, file, metaWithOwner, onProgress);
      setFiles(prev => [...prev, uploadedFileMeta]); // Add to local state if managing a list
      setIsLoading(false);
      return uploadedFileMeta;
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setIsLoading(false);
      throw err;
    }
  }, [user, getDirectoryPath]);

  const updateFileMetadata = useCallback(
    async (fullPath: string, newCustomMeta: Partial<FileCustomMetadata>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the method on the imported service instance
        const updatedMeta = await firebaseStorageService.updateFileMetadata(fullPath, newCustomMeta);
        setFiles((prevFiles) =>
          prevFiles.map((f) => (f.fullPath === fullPath ? updatedMeta : f))
        );
        setIsLoading(false);
        return updatedMeta;
      } catch (e: any) {
        setIsLoading(false);
        setError(e.message || "Update metadata failed");
        throw e;
      }
    },
    []
  );

  const getFileMetadata = useCallback(async (fullPath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Call the method on the imported service instance
      const meta = await firebaseStorageService.getFileMetadata(fullPath);
      setIsLoading(false);
      return meta;
    } catch (e: any) {
      setIsLoading(false);
      setError(e.message || "Get metadata failed");
      throw e;
    }
  }, []);

  const listFiles = useCallback(async (currentUserId?: string | null, path?: string) => {
    setIsLoading(true);
    setError(null);
    const effectiveDirectoryPath = path || getDirectoryPath();
    const userIdForAccessCheck = currentUserId || user?.uid || null;

    try {
      // Using listFilesRecursive for broader results, adjust if only non-recursive is needed
      const fetchedItems = await firebaseStorageService.listFilesRecursive(effectiveDirectoryPath);
      
      const accessibleFiles: FileMetadata[] = [];
      if (userIdForAccessCheck) { // Only filter if a user context is available
        for (const item of fetchedItems) {
          const hasAccess = await firebaseStorageService.checkFileAccess(item.fullPath, userIdForAccessCheck);
          if (hasAccess) {
            accessibleFiles.push(item);
          }
        }
         setFiles(accessibleFiles);
      } else { // If no user, assume public files or handle as per app logic (e.g. show all if path is public)
        // For now, if no userIdForAccessCheck, show all files from the path.
        // This might need refinement based on whether "public" paths truly exist or if all paths are user-specific.
        setFiles(fetchedItems.filter(item => item.customMeta?.accessLevel === 'public'));
      }
      setIsLoading(false);
    } catch (e: any) {
      setError(e.message || "List files failed");
      setIsLoading(false);
      throw e; // Re-throw to allow calling component to handle
    }
  }, [getDirectoryPath, user]);

  const deleteFile = useCallback(
    async (fullPath: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the method on the imported service instance
        await firebaseStorageService.deleteFile(fullPath);
        setFiles((prevFiles) => prevFiles.filter((f) => f.fullPath !== fullPath));
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        setError(e.message || "Delete file failed");
        throw e;
      }
    },
    []
  );
  
  // Effect to load files when component mounts or path/user changes
  useEffect(() => {
    if (user?.uid) { // Only load if user is available, or adjust logic for public paths
        listFiles(user.uid, getDirectoryPath());
    }
  }, [user?.uid, getDirectoryPath, listFiles]);

  return {
    files,
    isLoading,
    error,
    uploadFile, // Expose the generic uploadFile
    updateFileMetadata,
    getFileMetadata,
    listFiles,
    deleteFile,
    getDirectoryPath, // Expose if needed by components
    setError, // To allow clearing errors externally
    setIsLoading, // To allow external loading state changes if needed
  };
}