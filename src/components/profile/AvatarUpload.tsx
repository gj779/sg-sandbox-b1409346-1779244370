import { useState, useRef, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentPhotoURL?: string;
  onAvatarChange: (file: File) => void; // Changed from (url: string) => void
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export default function AvatarUpload({ 
  currentPhotoURL, 
  onAvatarChange,
  size = "md",
  className,
  disabled = false,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoURL || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser(); // Get user from context

  useEffect(() => {
    setPreview(currentPhotoURL || null);
  }, [currentPhotoURL]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (e.g., JPG, PNG, GIF).",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadstart = () => setIsLoading(true);
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onAvatarChange(file); // Pass the file object
        setIsLoading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Could not read the selected file. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Safely use the user context with error handling
  const userContext = useUser();
  const userProfile = userContext?.userProfile;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Handle upload confirmation
  const handleConfirmUpload = async () => {
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
        preview,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // Pass the URL to the parent component
      onAvatarChange(downloadURL);
      
      // Update preview
      setPreview(downloadURL);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setShowConfirmDialog(false);
    setUploadError(null);
    setPreview(null);
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
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-primary/10`}>
          <AvatarImage 
            src={preview} 
            alt="Profile avatar" 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {isLoading ? (
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
            disabled={disabled || !user} // Disable if no user is logged in
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
          onChange={handleFileChange}
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
                src={preview || ''} 
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