
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
import { Save, Loader2, AlertCircle, RefreshCw, Plus, X } from "lucide-react";
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
  const [experienceItems, setExperienceItems] = useState<string[]>([]);
  const [newExperience, setNewExperience] = useState("");
  
  const currentUserProfile = authUserProfile;

  useEffect(() => {
    if (currentUserProfile?.experience) {
      setExperienceItems(currentUserProfile.experience);
    }
  }, [currentUserProfile]);

  const handleAddExperience = () => {
    if (newExperience.trim()) {
      setExperienceItems(prev => [...prev, newExperience.trim()]);
      setNewExperience("");
    }
  };

  const handleRemoveExperience = (index: number) => {
    setExperienceItems(prev => prev.filter((_, i) => i !== index));
  };

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

  const onSubmit = async (formData: ProfileFormData) => {
    if (!user?.uid) return;
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Create a clean profile update object
      const profileUpdate: Partial<UserProfile> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        photoURL: formData.photoURL || undefined,
        userType: formData.userType as UserRole,
        isActive: formData.isActive,
        bio: formData.bio,
        location: formData.location,
        preferredLocation: formData.preferredLocation,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        cuisineType: formData.cuisineType,
        profileComplete: formData.profileComplete,
        experience: experienceItems,
        skills: formData.skills || [],
        education: formData.education?.map(eduString => ({
          institution: eduString,
          degree: "",
          field: "",
          fieldOfStudy: eduString,
          startDate: new Date(),
          current: false,
          isCurrentlyStudying: false
        })) || [], // Convert string array back to Education array
        preferences: {
          jobTypes: formData.jobPreferences || [],
          locations: [], // Add required locations array
          salary: { // Add required salary object
            min: undefined,
            max: undefined,
            currency: "USD"
          }
        },
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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema.partial()),
    defaultValues: async () => {
      if (currentUserProfile) {
        return {
          firstName: currentUserProfile.firstName || "",
          lastName: currentUserProfile.lastName || "",
          email: currentUserProfile.email!, 
          phoneNumber: currentUserProfile.phoneNumber || "",
          photoURL: currentUserProfile.photoURL || "", 
          userType: currentUserProfile.userType || UserRole.APPLICANT,
          isActive: currentUserProfile.isActive ?? true,
          bio: currentUserProfile.bio || "",
          skills: currentUserProfile.skills || [],
          availability: typeof currentUserProfile.availability === 'string' 
            ? currentUserProfile.availability 
            : Array.isArray(currentUserProfile.availability) 
              ? currentUserProfile.availability.join(', ')
              : "",
          preferredLocation: currentUserProfile.preferredLocation || "",
          education: currentUserProfile.education?.map(edu => 
            typeof edu === 'string' ? edu : edu.institution || edu.fieldOfStudy || ""
          ) || [], 
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
        experience: [],
        education: [], // Initialize as empty array
        jobPreferences: [],
        hiringPositions: [],
        jobTypes: [],
      };
    }
  });

  useEffect(() => {
    if (currentUserProfile || !authLoading) {
      setIsLoadingPage(false);
    }
  }, [currentUserProfile, authLoading]);

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profile | StaffSpace</title>
      </Head>
      <div className="container max-w-3xl py-8 md:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Profile</h1>
        <p className="text-muted-foreground mb-8">Update your personal information.</p>

        {formError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarUpload 
                  currentPhotoURL={currentUserProfile?.photoURL}
                  onAvatarChange={handleAvatarUpload}
                  size="lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>Email cannot be changed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Experience Section */}
                <div className="space-y-4">
                  <FormLabel>Experience</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={newExperience}
                      onChange={(e) => setNewExperience(e.target.value)}
                      placeholder="Add experience..."
                    />
                    <Button
                      type="button"
                      onClick={handleAddExperience}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {experienceItems.map((exp, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                        <span className="flex-1">{exp}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExperience(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
        <Button
          variant="outline"
          onClick={handleRefreshProfile}
          disabled={isRefreshing}
          className="mt-4"
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Profile Data
        </Button>
      </div>
    </>
  );
}