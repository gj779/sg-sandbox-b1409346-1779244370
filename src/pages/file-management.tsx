
import { useAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import FileBrowser from "@/components/file-storage/FileBrowser";
import { FileMetadata } from "@/types";

export default function FileManagementPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>Please sign in to access file management.</p>
      </div>
    );
  }

  const handleUploadSuccess = (file: FileMetadata) => {
    console.log("File uploaded successfully:", file);
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
  };

  const handleFileDelete = (path: string) => {
    console.log("File deleted:", path);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">File Management</h1>
      </div>

      <FileBrowser
        currentUserId={user.uid}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onFileDelete={handleFileDelete}
      />
    </div>
  );
}
