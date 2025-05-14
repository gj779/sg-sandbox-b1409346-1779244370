
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentPhotoURL?: string;
  onAvatarChange: (file: File) => void;
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
  const [isReadingFile, setIsReadingFile] = useState(false); // Renamed from isLoading for clarity
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, userProfile } = useUser();

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
      reader.onloadstart = () => setIsReadingFile(true);
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onAvatarChange(file); // Pass the selected file to the parent
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Could not read the selected file. Please try again.",
          variant: "destructive",
        });
        setIsReadingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email[0].toUpperCase();
    }
    return "?";
  };

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const buttonSizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-primary/10`}>
          <AvatarImage
            src={preview || undefined} // Use undefined if preview is null
            alt="Profile avatar"
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {isReadingFile ? (
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
            disabled={disabled || !user}
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
    </div>
  );
}
