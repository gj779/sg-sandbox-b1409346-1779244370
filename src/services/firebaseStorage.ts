import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata, updateMetadata } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { FileMetadata, FileCustomMetadata, FilePermission, UploadProgress } from "@/types";

// Helper function to generate a unique file ID
const generateFileId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Helper function to get file extension
const getFileExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

const firebaseStorageService = {
  async uploadFile(
    file: File,
    path: string,
    metadata: Partial<FileCustomMetadata>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const fileId = generateFileId();
    const extension = getFileExtension(file.name);
    const fullPath = `${path}${fileId}.${extension}`;
    const storageRef = ref(storage, fullPath);

    const customMetadata: FileCustomMetadata = {
      uploadedBy: metadata.uploadedBy || '',
      uploaderName: metadata.uploaderName || '',
      description: metadata.description,
      tags: metadata.tags,
      sharedWith: metadata.sharedWith || {},
      permissions: metadata.permissions || {},
      isPublic: metadata.isPublic || false
    };

    const uploadTask = uploadBytesResumable(storageRef, file, {
      customMetadata: customMetadata as { [key: string]: string }
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            onProgress({
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              status: snapshot.state.toLowerCase() as UploadProgress['status'],
              fileName: file.name,
              fileSize: snapshot.totalBytes,
              uploadedBytes: snapshot.bytesTransferred,
              taskId: fileId,
              state: snapshot.state,
              bytesTransferred: snapshot.bytesTransferred
            });
          }
        },
        (error) => {
          if (onProgress) {
            onProgress({
              progress: 0,
              status: 'error',
              error,
              fileName: file.name,
              fileSize: file.size,
              uploadedBytes: 0,
              taskId: fileId
            });
          }
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const metadata = await getMetadata(uploadTask.snapshot.ref);
            
            const fileMetadata: FileMetadata = {
              name: file.name,
              size: file.size,
              contentType: file.type,
              fullPath,
              path: fullPath,
              downloadURL,
              customMetadata,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            if (onProgress) {
              onProgress({
                progress: 100,
                status: 'success',
                downloadURL,
                fileName: file.name,
                fileSize: file.size,
                uploadedBytes: file.size,
                taskId: fileId
              });
            }

            resolve(fileMetadata);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  },

  async updateFileMetadata(
    path: string,
    updates: Partial<FileCustomMetadata>
  ): Promise<FileMetadata> {
    const storageRef = ref(storage, path);
    const currentMetadata = await getMetadata(storageRef);
    
    const updatedMetadata = {
      ...currentMetadata,
      customMetadata: {
        ...currentMetadata.customMetadata,
        ...updates,
      }
    };

    const metadata = await updateMetadata(storageRef, updatedMetadata);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      name: metadata.name,
      size: metadata.size,
      contentType: metadata.contentType,
      fullPath: metadata.fullPath,
      path: metadata.fullPath,
      downloadURL,
      customMetadata: updates as FileCustomMetadata,
      createdAt: new Date(metadata.timeCreated),
      updatedAt: new Date(metadata.updated)
    };
  },

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  async listFilesRecursive(path: string): Promise<FileMetadata[]> {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    const files: FileMetadata[] = [];

    for (const fileRef of result.items) {
      try {
        const metadata = await getMetadata(fileRef);
        const downloadURL = await getDownloadURL(fileRef);

        const fileMetadata: FileMetadata = {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType,
          fullPath: metadata.fullPath,
          path: metadata.fullPath,
          downloadURL,
          customMetadata: metadata.customMetadata as FileCustomMetadata,
          createdAt: new Date(metadata.timeCreated),
          updatedAt: new Date(metadata.updated)
        };

        files.push(fileMetadata);
      } catch (error) {
        console.error(`Error getting metadata for file ${fileRef.fullPath}:`, error);
      }
    }

    // Recursively list files in subdirectories
    for (const folderRef of result.prefixes) {
      try {
        const subFiles = await this.listFilesRecursive(folderRef.fullPath);
        files.push(...subFiles);
      } catch (error) {
        console.error(`Error listing files in folder ${folderRef.fullPath}:`, error);
      }
    }

    return files;
  },

  async checkFileAccess(path: string, userId: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      const customMetadata = metadata.customMetadata as FileCustomMetadata;

      // Check if file is public
      if (customMetadata.isPublic) {
        return true;
      }

      // Check if user is the owner
      if (customMetadata.uploadedBy === userId) {
        return true;
      }

      // Check shared permissions
      const userPermissions = customMetadata.permissions?.[userId];
      if (userPermissions) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking file access:', error);
      return false;
    }
  }
};

export { firebaseStorageService };