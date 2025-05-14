import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { firebaseStorageService, UploadProgress, FileMetadata } from "@/services/firebaseStorage";
import { useAuth } from "@/contexts/UserContext"; // Assuming you have a UserContext for auth
import { UploadCloud, File as FileIcon, X } from "lucide-react";

interface FileUploadProps {
  userId: string; // Or get from context
  folderPath?: string; // e.g., "documents/project-alpha/"
  onUploadSuccess?: (file: FileMetadata) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUpload({ userId, folderPath = `documents/${userId}/general`, onUploadSuccess, onUploadError }: FileUploadProps) {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [accessLevel, setAccessLevel] = useState<"private" | "shared" | "public">("private");
  const [sharedWith, setSharedWith] = useState(""); // Comma-separated user IDs

  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesToUpload(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleRemoveFile = (fileName: string) => {
    setFilesToUpload(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setUploadProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleUpload = async () => {
    if (!user) {
      setUploadError("User not authenticated.");
      return;
    }
    if (filesToUpload.length === 0) {
      setUploadError("No files selected to upload.");
      return;
    }

    setUploadError(null);

    for (const file of filesToUpload) {
      const fullPath = `${folderPath}/${file.name}`;
      try {
        const fileMetadata: FileMetadata = await firebaseStorageService.uploadFile(
          fullPath,
          file,
          {
            ownerId: userId,
            accessLevel,
            category,
            description,
            tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
            sharedWith: sharedWith.split(",").map(id => id.trim()).filter(id => id),
          },
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        );
        if (onUploadSuccess) {
          onUploadSuccess(fileMetadata);
        }
      } catch (error: any) {
        console.error("Upload failed for", file.name, error);
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { progress: 0, state: "error", bytesTransferred: 0, totalBytes: file.size, error },
        }));
        if (onUploadError) {
          onUploadError(error);
        }
        setUploadError(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    // Optionally clear files after upload attempt
    // setFilesToUpload([]); 
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg shadow-sm">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors
                    ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/50"}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        {isDragActive ? (
          <p className="mt-2 text-sm text-primary">Drop the files here ...</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Drag & drop some files here, or click to select files</p>
        )}
      </div>

      {filesToUpload.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Files to Upload:</h4>
          {filesToUpload.map(file => (
            <div key={file.name} className="p-3 border rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.name)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {uploadProgress[file.name] && (
                <div className="space-y-1">
                  <Progress value={uploadProgress[file.name].progress} className="w-full h-2" />
                  <p className="text-xs text-muted-foreground">
                    State: {uploadProgress[file.name].state} - {uploadProgress[file.name].bytesTransferred} / {uploadProgress[file.name].totalBytes} bytes
                  </p>
                  {uploadProgress[file.name].state === "error" && uploadProgress[file.name].error && (
                     <p className="text-xs text-red-500">Error: {uploadProgress[file.name].error?.message}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Invoices, Reports" />
        </div>
        <div>
          <Label htmlFor="accessLevel">Access Level</Label>
          <select
            id="accessLevel"
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as "private" | "shared" | "public")}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="private">Private</option>
            <option value="shared">Shared</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>
      
      {accessLevel === "shared" && (
        <div>
          <Label htmlFor="sharedWith">Share With (User IDs, comma-separated)</Label>
          <Input id="sharedWith" value={sharedWith} onChange={(e) => setSharedWith(e.target.value)} placeholder="user1_id,user2_id" />
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the file(s)" />
      </div>
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2, project-x" />
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleUpload} disabled={filesToUpload.length === 0 || Object.values(uploadProgress).some(p => p.state === "running")}>
        Upload Selected Files
      </Button>
    </div>
  );
}