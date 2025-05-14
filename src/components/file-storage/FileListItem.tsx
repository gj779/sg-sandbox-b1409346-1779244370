
import React, { useState } from "react";
import { FileMetadata, firebaseStorageService } from "@/services/firebaseStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Download, Edit3, Trash2, Share2, FileText, Image as ImageIcon, Video, AudioLines, Archive, FileQuestion } from "lucide-react";

interface FileListItemProps {
  file: FileMetadata;
  currentUserId: string; // To check ownership/permissions
  onDelete: (filePath: string) => void;
  onMetadataUpdate: (file: FileMetadata) => void;
}

const getFileIcon = (contentType: string) => {
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
  const [editData, setEditData] = useState({
    category: file.customMetadata?.category || "",
    description: file.customMetadata?.description || "",
    tags: file.customMetadata?.tags || "",
    accessLevel: file.customMetadata?.accessLevel || "private",
    sharedWith: file.customMetadata?.sharedWith || "",
  });
  const [error, setError] = useState<string | null>(null);

  const isOwner = file.customMetadata?.ownerId === currentUserId;

  const handleDelete = async () => {
    try {
      await firebaseStorageService.deleteFile(file.path);
      onDelete(file.path);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      setError(`Failed to delete file: ${err.message}`);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedMetadata = await firebaseStorageService.updateFileMetadata(file.path, {
        category: editData.category,
        description: editData.description,
        tags: editData.tags.split(",").map(t => t.trim()).filter(t => t),
        accessLevel: editData.accessLevel as "private" | "shared" | "public",
        sharedWith: editData.sharedWith.split(",").map(t => t.trim()).filter(t => t),
      });
      onMetadataUpdate(updatedMetadata);
      setShowEditModal(false);
      setError(null);
    } catch (err: any) {
      setError(`Failed to update meta ${err.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        {getFileIcon(file.contentType)}
        <div className="truncate">
          <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)} | Category: {file.customMetadata?.category || "N/A"} | Access: {file.customMetadata?.accessLevel || "N/A"}
          </p>
          {file.customMetadata?.description && <p className="text-xs text-muted-foreground truncate" title={file.customMetadata.description}>Desc: {file.customMetadata.description}</p>}
          {file.customMetadata?.tags && <p className="text-xs text-muted-foreground truncate">Tags: {file.customMetadata.tags}</p>}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" asChild>
          <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" download={file.name}>
            <Download className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Download</span>
          </a>
        </Button>
        {isOwner && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
            </Button>
          </>
        )}
        {/* Add share button if needed, potentially integrated with edit modal */}
      </div>

      {/* Delete Confirmation Dialog */}
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

      {/* Edit Metadata Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit File: {file.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">Category</Label>
              <Input id="edit-category" name="category" value={editData.category} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Input id="edit-description" name="description" value={editData.description} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tags" className="text-right">Tags</Label>
              <Input id="edit-tags" name="tags" value={editData.tags} onChange={handleInputChange} className="col-span-3" placeholder="tag1,tag2" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-accessLevel" className="text-right">Access</Label>
              <select
                id="edit-accessLevel"
                name="accessLevel"
                value={editData.accessLevel}
                onChange={handleInputChange}
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="public">Public</option>
              </select>
            </div>
            {editData.accessLevel === "shared" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-sharedWith" className="text-right">Share With</Label>
                <Input id="edit-sharedWith" name="sharedWith" value={editData.sharedWith} onChange={handleInputChange} className="col-span-3" placeholder="user1,user2" />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
