
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

export const firebaseStorageService = {
  // Upload a file and get download URL
  async uploadFile(
    path: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storageRef = ref(storage, path);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },
  
  // Get download URL for a file
  async getDownloadURL(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  },
  
  // Delete a file
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    return deleteObject(storageRef);
  }
};

// Helper functions for common storage operations
export const storageHelpers = {
  // Upload a resume file
  async uploadResume(userId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const path = `resumes/${userId}/${file.name}`;
    return firebaseStorageService.uploadFile(path, file, onProgress);
  },
  
  // Upload a profile image
  async uploadProfileImage(userId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const path = `profiles/${userId}/${file.name}`;
    return firebaseStorageService.uploadFile(path, file, onProgress);
  }
};
