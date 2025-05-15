import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  updateMetadata,
  deleteObject,
  listAll,
  FullMetadata,
} from "firebase/storage";
import { app } from "@/lib/firebase"; // Your Firebase app initialization
import { UploadProgress, FileMetadata, FileCustomMetadata } from "@/types"; // Ensure FileMetadata and FileCustomMetadata are from your types

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: "running" | "paused" | "success" | "error";
  error?: Error;
}

export interface FileCustomMetadata {
  ownerId?: string;
  accessLevel?: "private" | "shared" | "public";
  category?: string;
  description?: string;
  tags?: string[]; // Changed to string[]
  sharedWith?: string[]; // Changed to string[]
  originalName?: string;
  uploadedBy?: string;
}

export interface FileMetadata {
  name: string;
  path: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  downloadURL: string; // Added this field
  customMeta: FileCustomMetadata;
}


class FirebaseStorageService {
  private storage = getStorage(app);

  async uploadFile(
    filePath: string,
    file: File,
    customMeta: FileCustomMetadata = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const storageRef = ref(this.storage, filePath);
    const metadataToSet = {
      contentType: file.type,
      customMeta: {
        ...customMeta,
        tags: JSON.stringify(customMeta.tags || []), // Store as JSON string
        sharedWith: JSON.stringify(customMeta.sharedWith || []), // Store as JSON string
        originalName: file.name,
        uploadedBy: customMeta.ownerId, // Assuming ownerId is the uploader's ID
      },
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadataToSet);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const currentProgress: UploadProgress = {
            progress,
            state: snapshot.state as "error" | "running" | "paused" | "success" | "canceled", // Cast to ensure compatibility
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            error: undefined,
          };
          if (onProgress) {
            onProgress(currentProgress);
          }
        },
        (error) => {
          console.error("Upload failed:", error);
          if (onProgress) {
            onProgress({
              progress: 0,
              bytesTransferred: 0,
              totalBytes: file.size,
              state: "error",
              error,
            });
          }
          reject(error);
        },
        async () => {
          try {
            const uploadedFileMetadata = await this.getFileMetadata(filePath); // Get full metadata
             if (onProgress) {
              onProgress({
                progress: 100,
                bytesTransferred: file.size,
                totalBytes: file.size,
                state: "success",
              });
            }
            resolve(uploadedFileMetadata);
          } catch (error) {
            console.error("Failed to get metadata after upload:", error);
            reject(error);
          }
        }
      );
    });
  }

  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    const storageRef = ref(this.storage, filePath);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);

    const customMeta = metadata.customMetadata || {};
    
    let parsedTags: string[] = [];
    if (customMeta.tags && typeof customMeta.tags === "string") {
        try {
            const tagsAttempt = JSON.parse(customMeta.tags);
            if (Array.isArray(tagsAttempt)) {
                parsedTags = tagsAttempt.filter(tag => typeof tag === "string");
            } else {
                 parsedTags = [String(tagsAttempt)];
            }
        } catch (e) { 
            parsedTags = customMeta.tags.split(",").map(s => s.trim()).filter(s => s);
        }
    }

    let parsedSharedWith: string[] = [];
    if (customMeta.sharedWith && typeof customMeta.sharedWith === "string") {
        try {
            const sharedAttempt = JSON.parse(customMeta.sharedWith);
            if (Array.isArray(sharedAttempt)) {
                parsedSharedWith = sharedAttempt.filter(id => typeof id === "string");
            } else {
                parsedSharedWith = [String(sharedAttempt)];
            }
        } catch (e) {
            parsedSharedWith = customMeta.sharedWith.split(",").map(s => s.trim()).filter(s => s);
        }
    }

    return {
      name: metadata.name,
      path: metadata.fullPath, // Firebase SDK uses fullPath for path
      fullPath: metadata.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || "application/octet-stream",
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      downloadURL: downloadURL,
      customMeta: {
        ownerId: customMeta.ownerId,
        accessLevel: customMeta.accessLevel as FileCustomMetadata["accessLevel"],
        category: customMeta.category,
        description: customMeta.description,
        tags: parsedTags,
        sharedWith: parsedSharedWith,
        originalName: customMeta.originalName || metadata.name,
        uploadedBy: customMeta.uploadedBy,
      },
    };
  }

  async updateFileMetadata(
    filePath: string,
    newCustomMeta: Partial<FileCustomMetadata>
  ): Promise<FileMetadata> {
    const storageRef = ref(this.storage, filePath);
    
    const updateObject: { customMetadata?: any } = { customMeta: {} };

    // Merge with existing custom metadata if necessary, or build fresh
    const existingMetadata = await getMetadata(storageRef);
    updateObject.customMetadata = { ...(existingMetadata.customMetadata || {}) };


    if (newCustomMeta.ownerId !== undefined) updateObject.customMetadata.ownerId = newCustomMeta.ownerId;
    if (newCustomMeta.accessLevel !== undefined) updateObject.customMetadata.accessLevel = newCustomMeta.accessLevel;
    if (newCustomMeta.category !== undefined) updateObject.customMetadata.category = newCustomMeta.category;
    if (newCustomMeta.description !== undefined) updateObject.customMetadata.description = newCustomMeta.description;
    
    if (newCustomMeta.tags !== undefined) {
        updateObject.customMetadata.tags = JSON.stringify(Array.isArray(newCustomMeta.tags) ? newCustomMeta.tags : []);
    }
    if (newCustomMeta.sharedWith !== undefined) {
        updateObject.customMetadata.sharedWith = JSON.stringify(Array.isArray(newCustomMeta.sharedWith) ? newCustomMeta.sharedWith : []);
    }
    if (newCustomMeta.originalName !== undefined) updateObject.customMetadata.originalName = newCustomMeta.originalName;
    if (newCustomMeta.uploadedBy !== undefined) updateObject.customMetadata.uploadedBy = newCustomMeta.uploadedBy;

    // Remove undefined fields from customMetadata to avoid errors
    for (const key in updateObject.customMetadata) {
        if (updateObject.customMetadata[key] === undefined) {
            delete updateObject.customMetadata[key];
        }
    }
    // Ensure customMetadata itself is not set to null if it becomes empty
    if (Object.keys(updateObject.customMetadata).length === 0) {
        // Firebase might error if customMetadata is an empty object or null during update.
        // It's safer to set it to null to clear it, or ensure it has at least one valid field.
        // For clearing, you might need to pass null: await updateMetadata(storageRef, { customMeta: null });
        // For this implementation, we assume we are always setting some metadata.
        // If all fields are cleared, customMetadata will be an empty object.
    }


    await updateMetadata(storageRef, updateObject);
    return this.getFileMetadata(filePath); // Return full, updated metadata
  }

  async deleteFile(filePath: string): Promise<void> {
    const storageRef = ref(this.storage, filePath);
    await deleteObject(storageRef);
  }

  async listFiles(folderPath: string): Promise<FileMetadata[]> {
    const listRef = ref(this.storage, folderPath);
    const result = await listAll(listRef); // listAll is fine for non-recursive, gets items and prefixes

    const filesPromises = result.items.map(itemRef => 
        this.getFileMetadata(itemRef.fullPath).catch(e => {
            console.error(`Error getting metadata for ${itemRef.fullPath} in listFiles:`, e);
            return null;
        })
    );
    
    const files = (await Promise.all(filesPromises)).filter(file => file !== null) as FileMetadata[];
    return files;
  }

  async listFilesRecursive(folderPath: string): Promise<FileMetadata[]> {
    const listRef = ref(this.storage, folderPath);
    const result = await listAll(listRef);
    
    const filesPromises = result.items.map(itemRef => this.getFileMetadata(itemRef.fullPath).catch(e => {
      console.error(`Skipping file ${itemRef.fullPath} due to metadata error:`, e);
      return null; 
    }));
    
    const foldersPromises = result.prefixes.map(folderRef => this.listFilesRecursive(folderRef.fullPath));

    const files = (await Promise.all(filesPromises)).filter(file => file !== null) as FileMetadata[];
    const filesInFolders = (await Promise.all(foldersPromises)).flat();
    
    return [...files, ...filesInFolders];
  }


  async getDownloadUrl(filePath: string): Promise<string> {
    const storageRef = ref(this.storage, filePath);
    return getDownloadURL(storageRef);
  }

  async checkFileAccess(filePath: string, userId: string | null): Promise<boolean> {
    if (!userId) return false; 

    let metadata;
    try {
        metadata = await this.getFileMetadata(filePath);
    } catch (error: any) {
        // If file doesn't exist or metadata is inaccessible, deny access.
        // Specific error codes like 'storage/object-not-found' can be checked.
        console.warn(`Metadata check failed for ${filePath}: ${error.message}. Denying access.`);
        return false;
    }
    
    if (!metadata || !metadata.customMetadata) {
        console.warn(`No metadata or customMetadata found for ${filePath} in checkFileAccess. Denying access.`);
        return false; 
    }

    const { accessLevel, ownerId, sharedWith } = metadata.customMetadata;

    if (accessLevel === "public") return true;
    if (ownerId === userId) return true;

    if (accessLevel === "shared") {
        // sharedWith is now string[] from getFileMetadata
        if (!Array.isArray(sharedWith) || sharedWith.length === 0) return false;
        return sharedWith.includes(userId);
    }
    return false;
  }
}

export const firebaseStorageService = new FirebaseStorageService();