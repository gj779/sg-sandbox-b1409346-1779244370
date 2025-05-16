
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { firebaseStorageService } from "@/services/firebaseStorage";
import type { FileMetadata, FileCustomMetadata, FilePermission, UploadProgress } from "@/types";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { UploadCloud, File as FileIcon, XCircle } from "lucide-react";

interface FileUploadProps {
  currentUserId: string;
  onUploadSuccess: (uploadedFile: FileMetadata) => void;
  onUploadError?: (error: Error) => void;
}

export default function FileUpload({ currentUserId, onUploadSuccess, onUploadError }: FileUploadProps) {
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, UploadProgress>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [sharedWith, setSharedWith] = useState(""); // Comma-separated user IDs

  const { user: authUser } = useFirebaseAuth();
  const { toast } = useToast();

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
    if (!currentUserId) {
      setUploadError("User not authenticated.");
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
      // Convert shared users to permissions object
      const sharedWithObj: { [key: string]: FilePermission } = {};
      if (sharedWith.trim()) {
        sharedWith.split(",").forEach(userId => {
          const trimmedId = userId.trim();
          if (trimmedId) {
            sharedWithObj[trimmedId] = "read";
          }
        });
      }

      const metadata: Partial<FileCustomMetadata> = {
        uploadedBy: currentUserId,
        uploaderName: authUser?.displayName || authUser?.email || "Unknown",
        description: description || undefined,
        tags: tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : undefined,
        isPublic,
        sharedWith: Object.keys(sharedWithObj).length > 0 ? sharedWithObj : undefined,
        permissions: Object.keys(sharedWithObj).length > 0 ? sharedWithObj : undefined
      };

      try {
        const uploadedFile = await firebaseStorageService.uploadFile(
          file,
          `users/${currentUserId}/files`,
          metadata,
          (progress) => {
            setUploadProgressMap(prev => ({ ...prev, [file.name]: progress }));
          }
        );

        onUploadSuccess(uploadedFile);
        toast({ title: "Upload Success", description: `${file.name} uploaded successfully.` });
      } catch (error: any) {
        console.error("Upload failed for", file.name, error);
        const errorMessage = error.message || "Upload failed";
        setUploadError(`Failed to upload ${file.name}: ${errorMessage}`);
        if (onUploadError) {
          onUploadError(error);
        }
        toast({ 
          title: "Upload Failed", 
          description: `Could not upload ${file.name}: ${errorMessage}`, 
          variant: "destructive" 
        });
      }
    }

    setFilesToUpload([]);
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
                    {uploadProgressMap[file.name].status} - {uploadProgressMap[file.name].uploadedBytes} / {uploadProgressMap[file.name].fileSize} bytes
                  </p>
                  {uploadProgressMap[file.name].error && (
                    <p className="text-xs text-red-500">Error: {uploadProgressMap[file.name].error.message}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the file(s)"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, project-x"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="isPublic">Make public</Label>
        </div>
      </div>

      {!isPublic && (
        <div>
          <Label htmlFor="sharedWith">Share with (User IDs, comma-separated)</Label>
          <Input
            id="sharedWith"
            value={sharedWith}
            onChange={(e) => setSharedWith(e.target.value)}
            placeholder="user1,user2,user3"
          />
        </div>
      )}

      {uploadError && (
        <Alert variant="destructive">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleUpload}
        disabled={filesToUpload.length === 0 || Object.values(uploadProgressMap).some(p => p.status === "running")}
      >
        Upload Selected Files
      </Button>
    </div>
  );
}
