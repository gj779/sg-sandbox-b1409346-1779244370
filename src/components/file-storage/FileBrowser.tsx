
import React, { useState, useEffect } from 'react';
import { FileMetadata } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FileListItem from './FileListItem';
import FileUpload from './FileUpload';
import { firebaseStorageService } from '@/services/firebaseStorage';
import { Search } from 'lucide-react';

interface FileBrowserProps {
  currentUserId: string;
  onUploadSuccess?: (file: FileMetadata) => void;
  onUploadError?: (error: Error) => void;
  onFileDelete?: (path: string) => void;
}

export default function FileBrowser({ 
  currentUserId, 
  onUploadSuccess, 
  onUploadError,
  onFileDelete 
}: FileBrowserProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const fetchedFiles = await firebaseStorageService.listFiles();
      setFiles(fetchedFiles);
      setError(null);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedFile: FileMetadata) => {
    setFiles(prevFiles => [...prevFiles, uploadedFile]);
    onUploadSuccess?.(uploadedFile);
  };

  const handleUploadError = (error: Error) => {
    setError('Failed to upload file');
    onUploadError?.(error);
  };

  const handleDelete = async (path: string) => {
    try {
      setFiles(prevFiles => prevFiles.filter(file => file.path !== path));
      onFileDelete?.(path);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const handleMetadataUpdate = (updatedFile: FileMetadata) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.path === updatedFile.path ? updatedFile : file
      )
    );
  };

  const filteredFiles = files.filter(file => {
    const matchesSearchTerm = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (file.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (file.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearchTerm;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <FileUpload
          currentUserId={currentUserId}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading files...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => (
            <FileListItem
              key={file.path}
              file={file}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onMetadataUpdate={handleMetadataUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
