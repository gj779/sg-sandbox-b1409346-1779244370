import React, { useState, useEffect, useCallback } from "react";
import { FileMetadata, firebaseStorageService } from "@/services/firebaseStorage";
import FileListItem from "./FileListItem";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FolderOpen, Search, RefreshCw } from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"; // Changed from useAuth

interface FileBrowserProps {
  userId: string; 
  initialFolderPath?: string;
}

export default function FileBrowser({ userId, initialFolderPath }: FileBrowserProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(initialFolderPath || `documents/${userId}/`);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { user } = useFirebaseAuth(); // Changed from useAuth

  // Effect for path changes from props
  useEffect(() => {
    const newPath = initialFolderPath || `documents/${userId}/`;
    setCurrentPath(newPath);
  }, [initialFolderPath, userId]);


  const loadDirectoryFiles = useCallback(async (pathToList: string, isMountedChecker: () => boolean) => {
    if (!userId || !user) { // user from useFirebaseAuth
      if (isMountedChecker()) {
        setError(!user ? "User not authenticated." : "User ID is missing."); // user from useFirebaseAuth
        setIsLoading(false);
        setFiles([]);
      }
      return;
    }

    if (isMountedChecker()) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const fetchedItems = await firebaseStorageService.listFilesRecursive(pathToList);
      if (!isMountedChecker()) return;

      const accessibleItems = [];
      for (const item of fetchedItems) {
        if (!isMountedChecker()) return;
        // Ensure item.path is valid before checking access
        if (item && typeof item.path === "string") {
            const hasAccess = await firebaseStorageService.checkFileAccess(item.path, userId);
            if (hasAccess) {
                accessibleItems.push(item);
            }
        } else {
            console.warn("Skipping item with invalid path:", item);
        }
      }
      
      if (isMountedChecker()) {
        setFiles(accessibleItems);
      }
    } catch (err: any) {
      console.error("Error fetching files:", err);
      if (isMountedChecker()) {
        setError(`Failed to load files: ${err.message}`);
        setFiles([]);
      }
    } finally {
      if (isMountedChecker()) {
        setIsLoading(false);
      }
    }
  }, [userId, user]); // user from useFirebaseAuth

  useEffect(() => {
    let isMounted = true;
    const isMountedChecker = () => isMounted;
    
    loadDirectoryFiles(currentPath, isMountedChecker);

    return () => {
      isMounted = false;
    };
  }, [currentPath, loadDirectoryFiles, refreshTrigger]);


  const handleFileUploaded = (uploadedFile: FileMetadata) => {
    setFiles(prevFiles => {
      const existingFileIndex = prevFiles.findIndex(f => f.path === uploadedFile.path);
      if (existingFileIndex > -1) {
        const updatedFiles = [...prevFiles];
        updatedFiles[existingFileIndex] = uploadedFile;
        return updatedFiles;
      }
      return [uploadedFile, ...prevFiles];
    });
    setShowUpload(false); 
  };

  const handleFileDeleted = (filePath: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.path !== filePath));
  };
  
  const handleMetadataUpdated = (updatedFile: FileMetadata) => {
    setFiles(prevFiles => prevFiles.map(file => file.path === updatedFile.path ? updatedFile : file));
  };

  const filteredFiles = files.filter(file => {
    const matchesSearchTerm = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (file.customMeta?.description || "").toLowerCase().includes(searchTerm.toLowerCase()) || // Changed customMetadata to customMeta
                              (file.customMeta?.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())); // Changed customMetadata to customMeta and typed tag
    return matchesSearchTerm;
  });

  const navigateUp = () => {
    if (currentPath.endsWith("/")) {
        const newPath = currentPath.substring(0, currentPath.length -1); // remove trailing slash
        const lastSlash = newPath.lastIndexOf("/");
        if (lastSlash >= 0) { // Check for >=0 to handle root like "documents/"
            setCurrentPath(newPath.substring(0, lastSlash + 1));
        }
    } else { // Should not happen if paths always end with /
        const lastSlash = currentPath.lastIndexOf("/");
        if (lastSlash >= 0) {
            setCurrentPath(currentPath.substring(0, lastSlash + 1));
        }
    }
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) { // Check user from useFirebaseAuth for main render block
    return (
      <Alert variant="destructive">
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>You must be logged in to manage files.</AlertDescription>
      </Alert>
    );
  }
  
  // Ensure currentPath always ends with a slash for consistency
  const displayPath = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
  const rootPath = `documents/${userId}/`;
  const canNavigateUp = displayPath !== rootPath && displayPath.replace(/\/$/, "").includes("/");


  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">File Manager</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? "Cancel Upload" : "Upload New File"}
          </Button>
        </div>
      </div>

      {showUpload && (
        <FileUpload
          userId={userId} // Pass the prop userId
          directoryPath={displayPath} // Changed from folderPath to directoryPath
          onUploadSuccess={handleFileUploaded}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderOpen className="h-5 w-5" />
          <span>Current Path: {displayPath}</span>
          {canNavigateUp && (
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
              currentUserId={userId} // Pass the prop userId
              onDelete={handleFileDeleted}
              onMetadataUpdate={handleMetadataUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}