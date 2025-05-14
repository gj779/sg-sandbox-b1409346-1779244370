
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { storageHelpers } from "@/services/firebaseStorage";
import { useUser } from "@/contexts/UserContext";
import { 
  Camera, 
  Loader2, 
  X, 
  Check 
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface AvatarUploadProps {
  currentPhotoURL?: string;
  onAvatarChange: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({ 
  currentPhotoURL, 
  onAvatarChange,
  size = "md" 
}: AvatarUploadProps) {
  // Safely use the user context with error handling
  const userContext = useUser();
  const user = userContext?.user;
  const userProfile = userContext?.userProfile;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size classes based on the size prop
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };

  const buttonSizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
    
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  // Handle upload confirmation
  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      setUploadError("No file selected");
      return;
    }
    
    if (!user?.uid) {
      setUploadError("You must be logged in to upload a profile picture");
      return;
    }
    
    setShowConfirmDialog(false);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Upload the file to Firebase Storage
      const downloadURL = await storageHelpers.uploadProfileImage(
        user.uid, 
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // Pass the URL to the parent component
      onAvatarChange(downloadURL);
      
      // Update preview
      setPreviewUrl(downloadURL);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setShowConfirmDialog(false);
    setSelectedFile(null);
    setUploadError(null);
    
    // Revoke the object URL to avoid memory leaks
    if (previewUrl && !previewUrl.startsWith("http")) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(null);
  };

  // Get initials from user profile for avatar fallback
  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    
    if (userProfile?.email) {
      return userProfile.email[0].toUpperCase();
    }
    
    return "?";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-primary/10`}>
          <AvatarImage 
            src={previewUrl || currentPhotoURL} 
            alt="Profile avatar" 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Button 
            type="button"
            size="icon"
            variant="secondary"
            className={`absolute bottom-0 right-0 ${buttonSizeClasses[size]} rounded-full shadow-md`}
            onClick={() => fileInputRef.current?.click()}
            disabled={!user} // Disable if no user is logged in
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Change avatar</span>
          </Button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      
      {isUploading && (
        <div className="w-full max-w-xs">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center mt-1 text-muted-foreground">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
      
      {uploadError && (
        <p className="text-xs text-center text-destructive">{uploadError}</p>
      )}
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to use this image as your profile picture?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex justify-center py-4">
            <Avatar className="h-32 w-32 border-2 border-primary/10">
              <AvatarImage 
                src={previewUrl || ''} 
                alt="Preview" 
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpload}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpload}>
              <Check className="mr-2 h-4 w-4" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
