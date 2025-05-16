
import React, { useState } from "react";
import { FileMetadata, FileCustomMetadata } from "@/types";
import { firebaseStorageService } from "@/services/firebaseStorage";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Download, Edit2, Trash2, FileText, Image as ImageIcon, Video, AudioLines, Archive, FileQuestion } from "lucide-react";

interface FileListItemProps {
  file: FileMetadata;
  currentUserId: string;
  onDelete: (filePath: string) => void;
  onMetadataUpdate: (file: FileMetadata) => void;
}

const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileQuestion className="h-5 w-5 text-gray-500" />;
  if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (fileType.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />;
  if (fileType.startsWith("audio/")) return <AudioLines className="h-5 w-5 text-orange-500" />;
  if (fileType === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes("zip") || fileType.includes("archive")) return <Archive className="h-5 w-5 text-yellow-500" />;
  return <FileQuestion className="h-5 w-5 text-gray-500" />;
};

export default function FileListItem({ file, currentUserId, onDelete, onMetadataUpdate }: FileListItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentDescription, setCurrentDescription] = useState(file.description || "");
  const [currentTags, setCurrentTags] = useState((file.tags || []).join(", "));
  const [currentSharedWith, setCurrentSharedWith] = useState(
    (file.sharedWith || []).join(", ")
  );
  const [currentPermissions, setCurrentPermissions] = useState(file.permissions || []);
  const [error, setError] = useState<string | null>(null);

  const isOwner = file.uploadedBy === currentUserId;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      setIsDeleting(true);
      setError(null);
      try {
        await firebaseStorageService.deleteFile(file.path);
        onDelete(file.path);
        setShowDeleteConfirm(false);
      } catch (err: any) {
        console.error("Error deleting file:", err);
        setError(err.message || "Failed to delete file.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const newTags = currentTags.split(",").map(t => t.trim()).filter(tag => tag.length > 0);
      const newSharedWith = currentSharedWith.split(",").map(id => id.trim()).filter(id => id.length > 0);

      const newCustomMetadata: Partial<FileCustomMetadata> = {
        description: currentDescription,
        tags: newTags,
        sharedWith: newSharedWith,
        permissions: currentPermissions,
        uploadedBy: file.uploadedBy,
        uploaderName: file.uploaderName
      };
      
      const updatedFile = await firebaseStorageService.updateFileMetadata(file.path, newCustomMetadata);
      onMetadataUpdate(updatedFile);
      setShowEditModal(false);
    } catch (err: any) {
      console.error("Failed to update metadata", err);
      setError(`Failed to update metadata: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "description":
        setCurrentDescription(value);
        break;
      case "tags":
        setCurrentTags(value);
        break;
      case "sharedWith":
        setCurrentSharedWith(value);
        break;
    }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Reset edit data when modal opens/file changes
  React.useEffect(() => {
    if (showEditModal) {
      setCurrentDescription(file.description || "");
      setCurrentTags((file.tags || []).join(", "));
      setCurrentSharedWith((file.sharedWith || []).join(", "));
      setCurrentPermissions(file.permissions || []);
    }
  }, [file, showEditModal]);

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        {getFileIcon(file.fileType)}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{file.fileName}</h3>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.fileSize)} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
          </p>
          {file.description && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {file.description}
            </p>
          )}
          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {file.tags.map(tag => (
                <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" asChild>
          <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.fileName}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
        
        {isOwner && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete File</DialogTitle>
                </DialogHeader>
                <Alert variant="destructive">
                  <AlertTitle>Are you sure?</AlertTitle>
                  <AlertDescription>
                    This will permanently delete "{file.fileName}". This action cannot be undone.
                  </AlertDescription>
                </Alert>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit File Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={currentDescription}
                      onChange={handleInputChange}
                      placeholder="Add a description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={currentTags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sharedWith">Share with (user IDs)</Label>
                    <Input
                      id="sharedWith"
                      name="sharedWith"
                      value={currentSharedWith}
                      onChange={handleInputChange}
                      placeholder="user1, user2"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button onClick={handleEditSubmit} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
