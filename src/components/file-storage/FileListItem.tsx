import React, { useState } from "react";
import { FileMetadata, firebaseStorageService, FileCustomMetadata } from "@/services/firebaseStorage";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge"; // Not used currently
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Download, Edit3, Trash2, FileText, Image as ImageIcon, Video, AudioLines, Archive, FileQuestion } from "lucide-react";

interface FileListItemProps {
  file: FileMetadata;
  currentUserId: string;
  onDelete: (filePath: string) => void;
  onMetadataUpdate: (file: FileMetadata) => void;
}

const getFileIcon = (contentType?: string) => {
  if (!contentType) return <FileQuestion className="h-5 w-5 text-gray-500" />;
  if (contentType.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  if (contentType.startsWith("video/")) return <Video className="h-5 w-5 text-purple-500" />;
  if (contentType.startsWith("audio/")) return <AudioLines className="h-5 w-5 text-orange-500" />;
  if (contentType === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (contentType.includes("zip") || contentType.includes("archive")) return <Archive className="h-5 w-5 text-yellow-500" />;
  return <FileQuestion className="h-5 w-5 text-gray-500" />;
};

export default function FileListItem({ file, currentUserId, onDelete, onMetadataUpdate }: FileListItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [currentDescription, setCurrentDescription] = useState(file.customMeta?.description || ""); // Changed customMetadata to customMeta
  const [currentTags, setCurrentTags] = useState((file.customMeta?.tags || []).join(", ")); // Changed customMetadata to customMeta
  const [currentSharedWith, setCurrentSharedWith] = useState((file.customMeta?.sharedWith || []).join(", ")); // Changed customMetadata to customMeta
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, "read" | "write">> (file.customMeta?.permissions || {}); // Changed customMetadata to customMeta
  const [error, setError] = useState<string | null>(null);

  const isOwner = file.customMeta?.ownerId === currentUserId;

  const handleDelete = async () => {
    setError(null);
    try {
      await firebaseStorageService.deleteFile(file.path);
      onDelete(file.path);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error("Failed to delete file:", err);
      setError(`Failed to delete file: ${err.message}`);
    }
  };

  const handleEditSubmit = async () => {
    setError(null);
    try {
      const newTags = currentTags.split(",").map((t: string) => t.trim()).filter(t => t); // Typed t
      const newSharedWith = currentSharedWith.split(",").map((t: string) => t.trim()).filter(t => t); // Typed t

      const newCustomMeta: Partial<FileCustomMetadata> = {
        description: currentDescription,
        tags: newTags,
        sharedWith: newSharedWith,
        permissions: currentPermissions,
        // uploaderId and uploaderName should not be changed here by editor
        // uploaderId: file.customMeta?.uploaderId, 
        // uploaderName: file.customMeta?.uploaderName,
      };
      
      const updatedFile = await firebaseStorageService.updateFileMetadata(file.path, newCustomMeta);
      onMetadataUpdate(updatedFile);
      setShowEditModal(false);
    } catch (err: any) {
      console.error("Failed to update meta", err);
      setError(`Failed to update meta ${err.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "description") {
      setCurrentDescription(value);
    } else if (name === "tags") {
      setCurrentTags(value);
    } else if (name === "sharedWith") {
      setCurrentSharedWith(value);
    } else if (name === "permissions") {
      setCurrentPermissions(prev => ({ ...prev, [value]: prev[value] === "read" ? "write" : "read" }));
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

  // Reset editData when modal opens/file changes
  React.useEffect(() => {
    setCurrentDescription(file.customMeta?.description || ""); // Changed customMetadata to customMeta
    setCurrentTags((file.customMeta?.tags || []).join(", ")); // Changed customMetadata to customMeta
    setCurrentSharedWith((file.customMeta?.sharedWith || []).join(", ")); // Changed customMetadata to customMeta
    setCurrentPermissions(file.customMeta?.permissions || {}); // Changed customMetadata to customMeta
  }, [file, showEditModal]);


  const initialDescription = file.customMeta?.description || "N/A"; // Changed customMetadata to customMeta
  const initialTags = (file.customMeta?.tags || []).join(", ") || "N/A"; // Changed customMetadata to customMeta
  const uploaderName = file.customMeta?.uploaderName || "Unknown"; // Changed customMetadata to customMeta
  const uploaderId = file.customMeta?.uploaderId || "Unknown"; // Changed customMetadata to customMeta
  const initialSharedWith = (file.customMeta?.sharedWith || []).join(", ") || "N/A"; // Changed customMetadata to customMeta
  const initialPermissions = file.customMeta?.permissions || {}; // Changed customMetadata to customMeta

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        {getFileIcon(file.contentType)}
        <div className="truncate">
          <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)} | Category: {file.customMeta?.category || "N/A"} | Access: {file.customMeta?.accessLevel || "N/A"}
          </p>
          {file.customMeta?.description && <p className="text-xs text-muted-foreground truncate" title={file.customMeta.description}>Desc: {file.customMeta.description}</p>}
          {Array.isArray(file.customMeta?.tags) && file.customMeta.tags.length > 0 && (
            <p className="text-xs text-muted-foreground truncate">Tags: {file.customMeta.tags.join(", ")}</p>
          )}
          <p><strong>Description:</strong> {initialDescription}</p>
          <p><strong>Tags:</strong> {initialTags}</p>
          <p><strong>Uploaded by:</strong> {uploaderName} (ID: {uploaderId})</p>
          <p>
            <strong>Shared With:</strong> {initialSharedWith}
          </p>
          <p><strong>Permissions:</strong></p>
          <ul>
            {Object.entries(initialPermissions).map(([userId, perm]: [string, "read" | "write"]) => ( // Typed perm
              <li key={userId}>{userId}: {perm}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
        <Button variant="outline" size="sm" asChild>
          <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" download={file.name}>
            <Download className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Download</span>
          </a>
        </Button>
        {isOwner && (
          <>
            <Button variant="outline" size="sm" onClick={() => { setError(null); setShowEditModal(true); }}>
              <Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { setError(null); setShowDeleteConfirm(true); }}>
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
            </Button>
          </>
        )}
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Are you sure?</AlertTitle>
            <AlertDescription>
              This action will permanently delete the file "{file.name}". This cannot be undone.
            </AlertDescription>
          </Alert>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit File: {file.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" name="category" value={file.customMeta?.category || ""} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" name="description" value={currentDescription} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input id="edit-tags" name="tags" value={currentTags} onChange={handleInputChange} placeholder="tag1,tag2" />
            </div>
            <div>
              <Label htmlFor="edit-accessLevel">Access Level</Label>
              <select
                id="edit-accessLevel"
                name="accessLevel"
                value={file.customMeta?.accessLevel || "private"}
                onChange={handleInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="public">Public</option>
              </select>
            </div>
            {file.customMeta?.accessLevel === "shared" && (
              <div>
                <Label htmlFor="edit-sharedWith">Share With (User IDs, comma-separated)</Label>
                <Input id="edit-sharedWith" name="sharedWith" value={currentSharedWith} onChange={handleInputChange} placeholder="user1_id,user2_id" />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}