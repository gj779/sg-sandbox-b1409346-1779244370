import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { firebaseStorageService, FileCustomMetadata } from "@/services/firebaseStorage"; // Corrected import: uploadFileToStorage is not a direct export, use firebaseStorageService.uploadFile
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"; // Changed from useAuth
import { UploadCloud, File as FileIcon, XCircle } from "lucide-react";

interface FileUploadProps {
  userId?: string; // Optional userId, if not provided, will use authenticated user
  directoryPath?: string; // Optional directory path for uploads
  onUploadSuccess: (uploadedFile: FileMetadata) => void; // Changed to expect FileMetadata
}

export default function FileUpload({ userId: propUserId, directoryPath, onUploadSuccess }: FileUploadProps) {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, any>>({}); // Using 'any' for progress state for now
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [accessLevel, setAccessLevel] = useState<"private" | "shared" | "public">("private");
  const [sharedWith, setSharedWith] = useState(""); // Comma-separated user IDs

  const { user: authUser } = useFirebaseAuth(); // Changed from useAuth
  const { toast } = useToast();

  const effectiveUserId = propUserId || authUser?.uid;
  const currentDirectoryPath = directoryPath || (effectiveUserId ? `documents/${effectiveUserId}/general/` : `documents/public/general/`);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesToUpload(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleRemoveFile = (fileName: string) => {
    setFilesToUpload(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setUploadProgressMap(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleUpload = async () => {
    if (!effectiveUserId) {
      setUploadError("User not authenticated or user ID not provided.");
      toast({ title: "Upload Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (filesToUpload.length === 0) {
      setUploadError("No files selected to upload.");
      toast({ title: "Upload Error", description: "No files selected.", variant: "destructive" });
      return;
    }

    setUploadError(null);

    for (const file of filesToUpload) {
      const fullPath = `${currentDirectoryPath}${file.name}`.replace(/\/\//g, "/"); // Ensure no double slashes
      
      const metadataPayload: FileCustomMetadata = {
        ownerId: effectiveUserId,
        accessLevel,
        category,
        description,
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        sharedWith: sharedWith.split(",").map(id => id.trim()).filter(id => id),
        uploaderId: authUser?.uid,
        uploaderName: authUser?.displayName || authUser?.email || "Unknown Uploader",
      };

      try {
        const uploadedFileMetadata = await firebaseStorageService.uploadFile(
          fullPath,
          file,
          metadataPayload,
          (progress) => {
            setUploadProgressMap(prev => ({ ...prev, [file.name]: progress }));
          }
        );
        if (onUploadSuccess) {
          onUploadSuccess(uploadedFileMetadata); // Pass the full FileMetadata object
        }
        toast({ title: "Upload Success", description: `${file.name} uploaded successfully.` });
      } catch (error: any) {
        console.error("Upload failed for", file.name, error);
        setUploadProgressMap(prev => ({
          ...prev,
          [file.name]: { progress: 0, state: "error", bytesTransferred: 0, totalBytes: file.size, error },
        }));
        setUploadError(`Failed to upload ${file.name}: ${error.message}`);
        toast({ title: "Upload Failed", description: `Could not upload ${file.name}: ${error.message}`, variant: "destructive" });
      }
    }
    setFilesToUpload([]); // Clear files after attempting upload
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
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              {uploadProgressMap[file.name] && (
                <div className="space-y-1">
                  <Progress value={uploadProgressMap[file.name].progress} className="w-full h-2" />
                  <p className="text-xs text-muted-foreground">
                    State: {uploadProgressMap[file.name].state} - {uploadProgressMap[file.name].bytesTransferred} / {uploadProgressMap[file.name].totalBytes} bytes
                  </p>
                  {uploadProgressMap[file.name].state === "error" && uploadProgressMap[file.name].error && (
                     <p className="text-xs text-red-500">Error: {uploadProgressMap[file.name].error?.message}</p>
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

      <Button onClick={handleUpload} disabled={filesToUpload.length === 0 || Object.values(uploadProgressMap).some((p: any) => p.state === "running")}>
        Upload Selected Files
      </Button>
    </div>
  );
}