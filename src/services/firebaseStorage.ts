
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata, updateMetadata, SettableMetadata } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { FileMetadata, FileCustomMetadata, FilePermission, UploadProgress } from "@/types";

const generateFileId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const getFileExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

function serializeCustomMetadata(metadata: Partial<FileCustomMetadata>): { [key: string]: string } {
  const serialized: { [key: string]: string } = {};
  
  if (metadata.uploadedBy) serialized.uploadedBy = metadata.uploadedBy;
  if (metadata.uploaderName) serialized.uploaderName = metadata.uploaderName;
  if (metadata.description) serialized.description = metadata.description;
  if (metadata.isPublic !== undefined) serialized.isPublic = String(metadata.isPublic);
  if (metadata.tags && metadata.tags.length > 0) serialized.tags = JSON.stringify(metadata.tags);
  if (metadata.sharedWith && Object.keys(metadata.sharedWith).length > 0) {
    serialized.sharedWith = JSON.stringify(metadata.sharedWith);
  }
  if (metadata.permissions && Object.keys(metadata.permissions).length > 0) {
    serialized.permissions = JSON.stringify(metadata.permissions);
  }
  
  return serialized;
}

function deserializeCustomMetadata(firebaseCustomMetadata: { [key: string]: string } | undefined): FileCustomMetadata {
  const defaultMetadata: FileCustomMetadata = {
    uploadedBy: "",
    uploaderName: "",
    isPublic: false,
    tags: [],
    sharedWith: {},
    permissions: {},
    description: undefined
  };
  
  if (!firebaseCustomMetadata) {
    return defaultMetadata;
  }

  try {
    const parsedMetadata: FileCustomMetadata = {
      ...defaultMetadata,
      uploadedBy: firebaseCustomMetadata.uploadedBy || defaultMetadata.uploadedBy,
      uploaderName: firebaseCustomMetadata.uploaderName || defaultMetadata.uploaderName,
      description: firebaseCustomMetadata.description,
      isPublic: firebaseCustomMetadata.isPublic === "true",
      tags: firebaseCustomMetadata.tags ? JSON.parse(firebaseCustomMetadata.tags) : defaultMetadata.tags,
      sharedWith: firebaseCustomMetadata.sharedWith ? JSON.parse(firebaseCustomMetadata.sharedWith) : defaultMetadata.sharedWith,
      permissions: firebaseCustomMetadata.permissions ? JSON.parse(firebaseCustomMetadata.permissions) : defaultMetadata.permissions
    };
    return parsedMetadata;
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return defaultMetadata;
  }
}

const firebaseStorageService = {
  async uploadFile(
    file: File,
    path: string,
    metadata: Partial<FileCustomMetadata>,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const fileId = generateFileId();
    const extension = getFileExtension(file.name);
    const fullPath = `${path.endsWith("/") ? path : path + "/"}${fileId}.${extension}`;
    const storageRef = ref(storage, fullPath);

    const serializedMetadata = serializeCustomMetadata(metadata);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      customMetadata: serializedMetadata
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (onProgress) {
            onProgress({
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              status: snapshot.state.toLowerCase() as UploadProgress["status"],
              fileName: file.name,
              fileSize: snapshot.totalBytes,
              uploadedBytes: snapshot.bytesTransferred,
              taskId: fileId
            });
          }
        },
        (error) => {
          if (onProgress) {
            onProgress({
              progress: 0,
              status: "error",
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
            const fbMetadata = await getMetadata(uploadTask.snapshot.ref);
            
            const fileMetadata: FileMetadata = {
              name: fbMetadata.name || file.name,
              size: fbMetadata.size,
              contentType: fbMetadata.contentType || file.type,
              fullPath: fbMetadata.fullPath,
              path: fbMetadata.fullPath,
              downloadURL,
              customMetadata: deserializeCustomMetadata(fbMetadata.customMetadata),
              createdAt: new Date(fbMetadata.timeCreated),
              updatedAt: new Date(fbMetadata.updated)
            };

            if (onProgress) {
              onProgress({
                progress: 100,
                status: "success",
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
    const currentFbMetadata = await getMetadata(storageRef);
    
    const currentCustomMetadata = deserializeCustomMetadata(currentFbMetadata.customMetadata);
    const newCustomMetadata = { ...currentCustomMetadata, ...updates };
    const serializedNewMetadata = serializeCustomMetadata(newCustomMetadata);

    const metadataToUpdate: SettableMetadata = {
      customMetadata: serializedNewMetadata
    };

    const fbMetadata = await updateMetadata(storageRef, metadataToUpdate);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      name: fbMetadata.name || "",
      size: fbMetadata.size,
      contentType: fbMetadata.contentType || "",
      fullPath: fbMetadata.fullPath,
      path: fbMetadata.fullPath,
      downloadURL,
      customMetadata: deserializeCustomMetadata(fbMetadata.customMetadata),
      createdAt: new Date(fbMetadata.timeCreated),
      updatedAt: new Date(fbMetadata.updated)
    };
  },

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  async listFiles(path: string = "/"): Promise<FileMetadata[]> {
    return this.listFilesRecursive(path.endsWith("/") ? path : path + "/");
  },

  async listFilesRecursive(path: string): Promise<FileMetadata[]> {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    const files: FileMetadata[] = [];

    for (const fileRef of result.items) {
      try {
        const fbMetadata = await getMetadata(fileRef);
        const downloadURL = await getDownloadURL(fileRef);

        const fileMetadata: FileMetadata = {
          name: fbMetadata.name || "",
          size: fbMetadata.size,
          contentType: fbMetadata.contentType || "",
          fullPath: fbMetadata.fullPath,
          path: fbMetadata.fullPath,
          downloadURL,
          customMetadata: deserializeCustomMetadata(fbMetadata.customMetadata),
          createdAt: new Date(fbMetadata.timeCreated),
          updatedAt: new Date(fbMetadata.updated)
        };
        files.push(fileMetadata);
      } catch (error) {
        console.error(`Error getting metadata for file ${fileRef.fullPath}:`, error);
      }
    }

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
      const fbMetadata = await getMetadata(storageRef);
      const customMetadata = deserializeCustomMetadata(fbMetadata.customMetadata);

      if (customMetadata.isPublic) return true;
      if (customMetadata.uploadedBy === userId) return true;
      
      const userPermission = customMetadata.permissions?.[userId] || customMetadata.sharedWith?.[userId];
      if (userPermission) return true;

      return false;
    } catch (error) {
      console.error("Error checking file access:", error);
      return false;
    }
  }
};

export { firebaseStorageService };
export type { FileMetadata, FileCustomMetadata, FilePermission, UploadProgress };
