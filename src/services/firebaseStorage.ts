
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll, getMetadata, updateMetadata, SettableMetadata } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { FileMetadata, FileCustomMetadata, FilePermission, UploadProgress } from "@/types";

const generateFileId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

const getFileExtension = (filename: string) => filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);

function serializeCustomMetadata(metadata: Partial<FileCustomMetadata>): { [key: string]: string } {
  const serialized: { [key: string]: string } = {};

  if (metadata.userId) serialized.userId = metadata.userId;
  if (metadata.fileName) serialized.fileName = metadata.fileName;
  if (metadata.fileType) serialized.fileType = metadata.fileType;
  if (metadata.fileSize) serialized.fileSize = String(metadata.fileSize);
  if (metadata.uploadDate) serialized.uploadDate = metadata.uploadDate;
  if (metadata.lastModified) serialized.lastModified = metadata.lastModified;
  if (metadata.description) serialized.description = metadata.description;
  if (metadata.category) serialized.category = metadata.category;
  if (typeof metadata.isPublic === "boolean") serialized.isPublic = String(metadata.isPublic);
  
  if (Array.isArray(metadata.tags)) {
    serialized.tags = JSON.stringify(metadata.tags);
  }

  return serialized;
}

function deserializeCustomMetadata(firebaseCustomMetadata: { [key: string]: string } | undefined): FileCustomMetadata {
  const defaultMetadata: FileCustomMetadata = {
    userId: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
    uploadDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isPublic: false,
    tags: [],
    description: "",
    category: ""
  };

  if (!firebaseCustomMetadata) {
    return defaultMetadata;
  }

  try {
    const metadata: FileCustomMetadata = {
      userId: firebaseCustomMetadata.userId || defaultMetadata.userId,
      fileName: firebaseCustomMetadata.fileName || defaultMetadata.fileName,
      fileType: firebaseCustomMetadata.fileType || defaultMetadata.fileType,
      fileSize: parseInt(firebaseCustomMetadata.fileSize) || defaultMetadata.fileSize,
      uploadDate: firebaseCustomMetadata.uploadDate || defaultMetadata.uploadDate,
      lastModified: firebaseCustomMetadata.lastModified || defaultMetadata.lastModified,
      description: firebaseCustomMetadata.description || defaultMetadata.description,
      category: firebaseCustomMetadata.category || defaultMetadata.category,
      isPublic: firebaseCustomMetadata.isPublic === "true",
      tags: firebaseCustomMetadata.tags ? JSON.parse(firebaseCustomMetadata.tags) : defaultMetadata.tags
    };

    return metadata;
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

    const serializedMetadata = serializeCustomMetadata({
      ...metadata,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

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
              state: snapshot.state.toLowerCase() as UploadProgress["state"]
            });
          }
        },
        (error) => {
          if (onProgress) {
            onProgress({
              progress: 0,
              state: "error",
              error
            });
          }
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fbMetadata = await getMetadata(uploadTask.snapshot.ref);
            
            const fileMetadata: FileMetadata = {
              ...deserializeCustomMetadata(fbMetadata.customMetadata),
              path: fbMetadata.fullPath,
              url: downloadURL
            };

            if (onProgress) {
              onProgress({
                progress: 100,
                state: "success"
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
      ...deserializeCustomMetadata(fbMetadata.customMetadata),
      path: fbMetadata.fullPath,
      url: downloadURL
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
          ...deserializeCustomMetadata(fbMetadata.customMetadata),
          path: fbMetadata.fullPath,
          url: downloadURL
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

      if (customMetadata.isPublic === true) return true;
      if (customMetadata.userId === userId) return true;

      return false;
    } catch (error) {
      console.error("Error checking file access:", error);
      return false;
    }
  }
};

export { firebaseStorageService };
export type { FileMetadata, FileCustomMetadata, FilePermission, UploadProgress };
