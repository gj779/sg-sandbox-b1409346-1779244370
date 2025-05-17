
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { UserProfile, UserRole } from "@/types";
import { profilesService, userProfileSchema } from "@/services/profilesService";

type ProfileFormData = z.infer<typeof userProfileSchema>;

export default function EditProfilePage() {
  const { user, userProfile: authUserProfile, updateUserProfileData, uploadProfilePicture, isLoading: authLoading, fetchUserProfile } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const currentUserProfile = authUserProfile;

  const handleAvatarUpload = async (file: File) => {
    setAvatarFile(file);
  };

  const handleRefreshProfile = async () => {
    if (!user?.uid) return;
    
    setIsRefreshing(true);
    try {
      await fetchUserProfile(user.uid);
      toast({
        title: "Profile Refreshed",
        description: "Your profile data has been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Failed to refresh profile data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.uid) return;
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Create a clean profile update object
      const profileUpdate: Partial<UserProfile> = {
        ...data,
        photoURL: data.photoURL || undefined // Convert null to undefined
      };

      if (avatarFile) {
        const photoURL = await uploadProfilePicture(user.uid, avatarFile);
        if (photoURL) {
          profileUpdate.photoURL = photoURL;
        }
      }
      
      await updateUserProfileData(user.uid, profileUpdate);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      router.push("/profile");
    } catch (error) {
      console.error("Profile update error:", error);
      setFormError("Failed to update profile. Please try again.");
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was an error updating your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of the component remains the same...
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema.partial()),
    defaultValues: async () => {
      if (currentUserProfile) {
        const userType = currentUserProfile.userType || UserRole.APPLICANT;
        
        let skills: string[] = [];
        if (Array.isArray(currentUserProfile.skills)) {
          skills = currentUserProfile.skills;
        } else if (typeof currentUserProfile.skills === 'string') {
          skills = currentUserProfile.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        return {
          firstName: currentUserProfile.firstName || "",
          lastName: currentUserProfile.lastName || "",
          email: currentUserProfile.email!, 
          phoneNumber: currentUserProfile.phoneNumber || "",
          photoURL: currentUserProfile.photoURL || "", 
          userType,
          isActive: currentUserProfile.isActive ?? true,
          bio: currentUserProfile.bio || "",
          skills,
          experience: typeof currentUserProfile.experience === "string" ? currentUserProfile.experience : "",
          availability: Array.isArray(currentUserProfile.availability) 
            ? currentUserProfile.availability.map(av => typeof av === 'string' ? av : (av as any).day)
            : [],
          preferredLocation: currentUserProfile.preferredLocation || "",
          education: typeof currentUserProfile.education === "string" ? currentUserProfile.education : "",
          jobPreferences: currentUserProfile.preferences?.jobTypes || [],
          location: currentUserProfile.location || "",
          businessName: currentUserProfile.businessName || "",
          businessAddress: currentUserProfile.businessAddress || "",
          businessDescription: currentUserProfile.bio || "",
          cuisineType: currentUserProfile.cuisineType || "",
          hiringPositions: [],
          jobTypes: [],
          benefits: "",
          profileComplete: currentUserProfile.profileComplete ?? false,
        };
      }
      
      return { 
        email: "", 
        userType: UserRole.APPLICANT,
        firstName: "", 
        lastName: "", 
        isActive: true,
        skills: [],
        jobPreferences: [],
        hiringPositions: [],
        jobTypes: [],
      };
    }
  });

  // Rest of the component implementation remains the same...
  return (
    // JSX remains the same...
  );
}
