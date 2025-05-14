
import React, { useState, useEffect, useCallback } from "react";
import { FileMetadata, firebaseStorageService } from "@/services/firebaseStorage";
import FileListItem from "./FileListItem";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FolderOpen, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";

interface FileBrowserProps {
  userId: string; // Or get from context
  initialFolderPath?: string; // e.g., "documents/userId/"
}

export default function FileBrowser({ userId, initialFolderPath }: FileBrowserProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(initialFolderPath || `documents/${userId}/`);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const { user } = useAuth();

  const fetchFiles = useCallback(async (path: string) => {
    if (!user) {
        setError("User not authenticated.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // For simplicity, listing recursively. Could be adapted for non-recursive listing.
      const fetchedFiles = await firebaseStorageService.listFilesRecursive(path);
      // Filter out files that the user might not have direct access to if listing a broader path
      // This example assumes `listFilesRecursive` already handles some level of access or we filter client-side
      const accessibleFiles = [];
      for (const file of fetchedFiles) {
        if (await firebaseStorageService.checkFileAccess(file.path, userId)) {
            accessibleFiles.push(file);
        }
      }
      setFiles(accessibleFiles);
    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError(`Failed to load files from ${path}: ${err.message}`);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const handleFileUploaded = (uploadedFile: FileMetadata) => {
    setFiles(prevFiles => [uploadedFile, ...prevFiles.filter(f => f.path !== uploadedFile.path)]); // Add or update
    setShowUpload(false); // Optionally hide upload form after success
  };

  const handleFileDeleted = (filePath: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.path !== filePath));
  };
  
  const handleMetadataUpdated = (updatedFile: FileMetadata) => {
    setFiles(prevFiles => prevFiles.map(file => file.path === updatedFile.path ? updatedFile : file));
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.customMetadata?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.customMetadata?.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.customMetadata?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Basic path navigation (very simplified)
  const navigateUp = () => {
    if (currentPath.endsWith("/")) {
        const newPath = currentPath.substring(0, currentPath.length -1);
        const lastSlash = newPath.lastIndexOf("/");
        if (lastSlash > 0) {
            setCurrentPath(newPath.substring(0, lastSlash + 1));
        }
    } else {
        const lastSlash = currentPath.lastIndexOf("/");
        if (lastSlash > 0) {
            setCurrentPath(currentPath.substring(0, lastSlash + 1));
        }
    }
  };

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>You must be logged in to manage files.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">File Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => fetchFiles(currentPath)} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? "Cancel Upload" : "Upload New File"}
          </Button>
        </div>
      </div>

      {showUpload && (
        <FileUpload
          userId={userId}
          folderPath={currentPath}
          onUploadSuccess={handleFileUploaded}
          onUploadError={(err) => setError(`Upload failed: ${err.message}`)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderOpen className="h-5 w-5" />
          <span>Current Path: {currentPath}</span>
          {currentPath !== `documents/${userId}/` && currentPath !== `documents/${userId}` && (
            <Button onClick={navigateUp} size="sm" variant="ghost">Up</Button>
          )}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No files found in this location or matching your search.</p>
          <p className="text-sm text-muted-foreground">Try uploading some files or adjusting your search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map(file => (
            <FileListItem 
              key={file.path} 
              file={file} 
              currentUserId={userId}
              onDelete={handleFileDeleted}
              onMetadataUpdate={handleMetadataUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
