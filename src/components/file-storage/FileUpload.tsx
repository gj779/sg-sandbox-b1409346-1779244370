
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Upload } from "lucide-react";
import { firebaseStorageService } from "@/services/firebaseStorage";
import type { FileMetadata, UploadProgress } from "@/types";

interface FileUploadProps {
  currentUserId: string;
  onUploadSuccess?: (file: FileMetadata) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUpload({ currentUserId, onUploadSuccess, onUploadError }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress(progress);
    if (progress.state === "error" && progress.error) {
      setError(progress.error.message || "Upload failed");
      onUploadError?.(progress.error);
    }
  }, [onUploadError]);

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setUploadProgress({ progress: 0, state: "running" });

    try {
      const metadata = {
        userId: currentUserId,
        uploadedBy: currentUserId,
        isPublic: false,
        tags: [],
        permissions: []
      };

      const uploadedFile = await firebaseStorageService.uploadFile(
        file,
        "uploads",
        metadata,
        handleUploadProgress
      );

      onUploadSuccess?.(uploadedFile);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
      onUploadError?.(err);
    }
  }, [currentUserId, onUploadSuccess, onUploadError, handleUploadProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    multiple: false
  });

  const renderProgress = () => {
    if (!uploadProgress) return null;

    const progressValue = uploadProgress.progress;
    const isUploading = uploadProgress.state === "running";
    const isComplete = uploadProgress.state === "success";
    const isFailed = uploadProgress.state === "error";

    return (
      <div className="mt-4">
        <Progress value={progressValue} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {isUploading && "Uploading..."}
          {isComplete && "Upload complete"}
          {isFailed && "Upload failed"}
          {isUploading && ` ${Math.round(progressValue)}%`}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          hover:border-primary hover:bg-primary/5
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm">Drop the file here</p>
          ) : (
            <>
              <p className="text-sm">Drag & drop a file here, or click to select</p>
              <Button variant="outline" size="sm" type="button">
                Select File
              </Button>
            </>
          )}
        </div>
      </div>

      {renderProgress()}

      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}
    </div>
  );
}