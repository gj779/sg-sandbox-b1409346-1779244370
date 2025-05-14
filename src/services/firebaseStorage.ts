
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata, updateMetadata, StorageReference, ListResult } from "firebase/storage";
import { storage } from "@/lib/firebase";

// File metadata interface
export interface FileMetadata {
  name: string;
  path: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  downloadURL: string;
  customMetadata?: {
    ownerId?: string;
    accessLevel?: "private" | "shared" | "public";
    category?: string;
    description?: string;
    tags?: string;
    sharedWith?: string; // Comma-separated user IDs
  };
}

// Upload progress interface
export interface UploadProgress {
  progress: number;
  state: "paused" | "running" | "success" | "error" | "canceled";
  bytesTransferred: number;
  totalBytes: number;
  error?: Error;
}

export const firebaseStorageService = {
  // Upload a file and get download URL with enhanced metadata
  async uploadFile(
    path: string, 
    file: File, 
    metadata: {
      ownerId: string;
      accessLevel?: "private" | "shared" | "public";
      category?: string;
      description?: string;
      tags?: string[];
      sharedWith?: string[];
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const storageRef = ref(storage, path);
    
    // Prepare custom metadata
    const customMetadata = {
      ownerId: metadata.ownerId,
      accessLevel: metadata.accessLevel || "private",
      category: metadata.category || "uncategorized",
      description: metadata.description || "",
      tags: metadata.tags ? metadata.tags.join(",") : "",
      sharedWith: metadata.sharedWith ? metadata.sharedWith.join(",") : "",
    };
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata
      });
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress({
              progress,
              state: snapshot.state,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            });
          }
        },
        (error) => {
          if (onProgress) {
            onProgress({
              progress: 0,
              state: "error",
              bytesTransferred: 0,
              totalBytes: 0,
              error
            });
          }
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const metadata = await getMetadata(uploadTask.snapshot.ref);
          
          resolve({
            name: metadata.name,
            path: metadata.fullPath,
            contentType: metadata.contentType || "",
            size: metadata.size,
            createdAt: metadata.timeCreated,
            updatedAt: metadata.updated,
            downloadURL,
            customMetadata: metadata.customMetadata
          });
        }
      );
    });
  },
  
  // Get download URL for a file
  async getDownloadURL(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  },
  
  // Get file metadata
  async getFileMetadata(path: string): Promise<FileMetadata> {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      name: metadata.name,
      path: metadata.fullPath,
      contentType: metadata.contentType || "",
      size: metadata.size,
      createdAt: metadata.timeCreated,
      updatedAt: metadata.updated,
      downloadURL,
      customMetadata: metadata.customMetadata
    };
  },
  
  // Update file metadata
  async updateFileMetadata(
    path: string, 
    metadata: {
      accessLevel?: "private" | "shared" | "public";
      category?: string;
      description?: string;
      tags?: string[];
      sharedWith?: string[];
    }
  ): Promise<FileMetadata> {
    const storageRef = ref(storage, path);
    
    // Prepare custom metadata
    const customMetadata: Record<string, string> = {};
    
    if (metadata.accessLevel) customMetadata.accessLevel = metadata.accessLevel;
    if (metadata.category) customMetadata.category = metadata.category;
    if (metadata.description) customMetadata.description = metadata.description;
    if (metadata.tags) customMetadata.tags = metadata.tags.join(",");
    if (metadata.sharedWith) customMetadata.sharedWith = metadata.sharedWith.join(",");
    
    await updateMetadata(storageRef, { customMetadata });
    return this.getFileMetadata(path);
  },
  
  // Delete a file
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    return deleteObject(storageRef);
  },
  
  // List files in a directory
  async listFiles(directory: string): Promise<FileMetadata[]> {
    const storageRef = ref(storage, directory);
    const result = await listAll(storageRef);
    
    const filePromises = result.items.map(async (itemRef) => {
      try {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);
        
        return {
          name: metadata.name,
          path: metadata.fullPath,
          contentType: metadata.contentType || "",
          size: metadata.size,
          createdAt: metadata.timeCreated,
          updatedAt: metadata.updated,
          downloadURL,
          customMetadata: metadata.customMetadata
        };
      } catch (error) {
        console.error(`Error getting metadata for ${itemRef.fullPath}:`, error);
        return null;
      }
    });
    
    const files = await Promise.all(filePromises);
    return files.filter((file): file is FileMetadata => file !== null);
  },
  
  // List files recursively (including subdirectories)
  async listFilesRecursive(directory: string): Promise<FileMetadata[]> {
    const storageRef = ref(storage, directory);
    const result = await listAll(storageRef);
    
    // Process files in current directory
    const filePromises = result.items.map(async (itemRef) => {
      try {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);
        
        return {
          name: metadata.name,
          path: metadata.fullPath,
          contentType: metadata.contentType || "",
          size: metadata.size,
          createdAt: metadata.timeCreated,
          updatedAt: metadata.updated,
          downloadURL,
          customMetadata: metadata.customMetadata
        };
      } catch (error) {
        console.error(`Error getting metadata for ${itemRef.fullPath}:`, error);
        return null;
      }
    });
    
    // Process subdirectories recursively
    const subDirPromises = result.prefixes.map(prefix => 
      this.listFilesRecursive(prefix.fullPath)
    );
    
    // Combine results
    const files = await Promise.all(filePromises);
    const subDirFiles = await Promise.all(subDirPromises);
    
    return [
      ...files.filter((file): file is FileMetadata => file !== null),
      ...subDirFiles.flat()
    ];
  },
  
  // Check if user has access to a file
  async checkFileAccess(path: string, userId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(path);
      
      if (!metadata.customMetadata) return false;
      
      const { ownerId, accessLevel, sharedWith } = metadata.customMetadata;
      
      // Owner always has access
      if (ownerId === userId) return true;
      
      // Public files are accessible to everyone
      if (accessLevel === "public") return true;
      
      // Shared files are accessible to specific users
      if (accessLevel === "shared" && sharedWith) {
        const sharedWithArray = sharedWith.split(",");
        return sharedWithArray.includes(userId);
      }
      
      return false;
    } catch (error) {
      console.error("Error checking file access:", error);
      return false;
    }
  }
};

// Helper functions for common storage operations
export const storageHelpers = {
  // Upload a resume file
  async uploadResume(userId: string, file: File, metadata: { description?: string, tags?: string[] }, onProgress?: (progress: UploadProgress) => void): Promise<FileMetadata> {
    const path = `resumes/${userId}/${file.name}`;
    return firebaseStorageService.uploadFile(
      path, 
      file, 
      {
        ownerId: userId,
        accessLevel: "private",
        category: "resume",
        description: metadata.description,
        tags: metadata.tags
      },
      onProgress
    );
  },
  
  // Upload a profile image
  async uploadProfileImage(userId: string, file: File, onProgress?: (progress: UploadProgress) => void): Promise<FileMetadata> {
    const path = `profiles/${userId}/${file.name}`;
    return firebaseStorageService.uploadFile(
      path, 
      file, 
      {
        ownerId: userId,
        accessLevel: "public",
        category: "profile"
      },
      onProgress
    );
  },
  
  // Upload a document to a specific folder
  async uploadDocument(
    userId: string, 
    file: File, 
    folder: string,
    metadata: {
      accessLevel?: "private" | "shared" | "public";
      category?: string;
      description?: string;
      tags?: string[];
      sharedWith?: string[];
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const path = `documents/${userId}/${folder}/${file.name}`;
    return firebaseStorageService.uploadFile(
      path, 
      file, 
      {
        ownerId: userId,
        ...metadata
      },
      onProgress
    );
  },
  
  // Get all user documents
  async getUserDocuments(userId: string, folder?: string): Promise<FileMetadata[]> {
    const path = folder 
      ? `documents/${userId}/${folder}`
      : `documents/${userId}`;
    
    return firebaseStorageService.listFilesRecursive(path);
  },
  
  // Get files shared with a user
  async getSharedFiles(userId: string): Promise<FileMetadata[]> {
    // This is a simplified approach - in a real app, you might want to use Firestore
    // to track shared files instead of scanning all files
    const allUserFiles = await firebaseStorageService.listFilesRecursive("documents");
    
    return allUserFiles.filter(file => {
      if (!file.customMetadata) return false;
      
      const { accessLevel, sharedWith } = file.customMetadata;
      
      if (accessLevel === "public") return true;
      
      if (accessLevel === "shared" && sharedWith) {
        const sharedWithArray = sharedWith.split(",");
        return sharedWithArray.includes(userId);
      }
      
      return false;
    });
  }
};
