import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"; // Using direct hook
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Save,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { UserProfile } from "@/types"; // Using the comprehensive UserProfile from types
import { profilesService, userProfileSchema } from "@/services/profilesService";

// Define a type for the form data based on the schema from profilesService
type ProfileFormData = z.infer<typeof userProfileSchema>;

export default function EditProfilePage() {
  const { user, userProfile: authUserProfile, updateUserProfileData, uploadProfilePicture, isLoading: authLoading, fetchUserProfile } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Page specific loading
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Use the userProfile from useFirebaseAuth as the source of truth for initial form values
  const currentUserProfile = authUserProfile; 

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(userProfileSchema.partial()), // Use partial for updates
    defaultValues: async () => {
      if (currentUserProfile) {
        // Ensure all fields required by ProfileFormData (even if optional in UserProfile)
        // have a default value if not present in currentUserProfile, or are explicitly undefined.
        return {
          firstName: currentUserProfile.firstName || "",
          lastName: currentUserProfile.lastName || "",
          email: currentUserProfile.email!, // email is non-optional in UserProfile
          phoneNumber: currentUserProfile.phoneNumber || "",
          photoURL: currentUserProfile.photoURL || "", // Zod schema allows empty string or null
          userType: currentUserProfile.userType, // userType is non-optional
          isActive: currentUserProfile.isActive !== undefined ? currentUserProfile.isActive : true,
          
          bio: currentUserProfile.bio || "",
          skills: Array.isArray(currentUserProfile.skills) 
            ? currentUserProfile.skills 
            : (typeof currentUserProfile.skills === 'string' ? currentUserProfile.skills.split(',').map(s => s.trim()).filter(s => s) : undefined),
          experience: typeof currentUserProfile.experience === "string" ? currentUserProfile.experience : "",
          availability: Array.isArray(currentUserProfile.availability) 
            ? currentUserProfile.availability.map(av => typeof av === 'string' ? av : (av as any).day) // Ensure 'av' is treated correctly
            : [],
          preferredLocation: currentUserProfile.preferredLocation || "",
          education: typeof currentUserProfile.education === "string" ? currentUserProfile.education : "",
          jobPreferences: currentUserProfile.jobPreferences || [],
          location: currentUserProfile.location || "",
          
          businessName: currentUserProfile.businessName || "",
          businessAddress: currentUserProfile.businessAddress || "",
          businessDescription: currentUserProfile.businessDescription || currentUserProfile.bio || "",
          cuisineType: typeof currentUserProfile.cuisineType === "string" ? currentUserProfile.cuisineType : "",
          hiringPositions: currentUserProfile.hiringPositions || [],
          jobTypes: currentUserProfile.jobTypes || [],
          benefits: currentUserProfile.benefits || "",
          profileComplete: currentUserProfile.profileComplete !== undefined ? currentUserProfile.profileComplete : false,
          // Ensure 'name' is also provided if it's part of ProfileFormData and non-optional
          name: currentUserProfile.name || `${currentUserProfile.firstName || ""} ${currentUserProfile.lastName || ""}`.trim(),
        };
      }
      // Return a structure that satisfies ProfileFormData if currentUserProfile is null
      // This might mean providing default empty/null/undefined values for all fields.
      // However, this block should ideally not be reached if the page is protected.
      return { 
        email: "", 
        userType: "applicant", 
        firstName: "", 
        lastName: "", 
        isActive: true, 
        name: "" 
        /* other fields as undefined or default */ 
      };
    }
  });

  useEffect(() => {
    if (currentUserProfile || !authLoading) {
      setIsLoadingPage(false);
      if (currentUserProfile) {
        form.reset({
          firstName: currentUserProfile.firstName || "",
          lastName: currentUserProfile.lastName || "",
          email: currentUserProfile.email!, // email is non-optional
          phoneNumber: currentUserProfile.phoneNumber || "",
          photoURL: currentUserProfile.photoURL || "",
          userType: currentUserProfile.userType, // userType is non-optional
          isActive: currentUserProfile.isActive !== undefined ? currentUserProfile.isActive : true,
          bio: currentUserProfile.bio || "",
          skills: Array.isArray(currentUserProfile.skills) 
            ? currentUserProfile.skills 
            : (typeof currentUserProfile.skills === 'string' ? currentUserProfile.skills.split(',').map(s => s.trim()).filter(s => s) : undefined),
          experience: typeof currentUserProfile.experience === "string" ? currentUserProfile.experience : "",
          availability: Array.isArray(currentUserProfile.availability) 
            ? currentUserProfile.availability.map(av => typeof av === 'string' ? av : (av as any).day) 
            : [],
          preferredLocation: currentUserProfile.preferredLocation || "",
          education: typeof currentUserProfile.education === "string" ? currentUserProfile.education : "",
          jobPreferences: currentUserProfile.jobPreferences || [],
          location: currentUserProfile.location || "",
          businessName: currentUserProfile.businessName || "",
          businessAddress: currentUserProfile.businessAddress || "",
          businessDescription: currentUserProfile.businessDescription || currentUserProfile.bio || "",
          cuisineType: typeof currentUserProfile.cuisineType === "string" ? currentUserProfile.cuisineType : "",
          hiringPositions: currentUserProfile.hiringPositions || [],
          jobTypes: currentUserProfile.jobTypes || [],
          benefits: currentUserProfile.benefits || "",
          profileComplete: currentUserProfile.profileComplete !== undefined ? currentUserProfile.profileComplete : false,
          name: currentUserProfile.name || `${currentUserProfile.firstName || ""} ${currentUserProfile.lastName || ""}`.trim(),
        });
      }
    }
  }, [currentUserProfile, authLoading, form]);


  const handleRefreshProfile = async () => {
    if (isRefreshing || !user?.uid) return;
    setIsRefreshing(true);
    setFormError(null);
    try {
      const refreshedProfile = await fetchUserProfile(user.uid);
      if (refreshedProfile) {
        // form.reset will be handled by the useEffect above when authUserProfile updates
        toast({
          title: "Profile refreshed",
          description: "Your profile data has been refreshed successfully.",
        });
      } else {
        throw new Error("Failed to refresh profile data");
      }
    } catch (error: any) {
      setFormError(error.message || "Failed to refresh profile data.");
      toast({
        title: "Error",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
  };

  const onSubmit = async (formDataFromSubmit: ProfileFormData) => { // Changed parameter name
    if (!user?.uid) {
      setFormError("User not authenticated.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      let uploadedPhotoURL = currentUserProfile?.photoURL;
      if (avatarFile) {
        const newPhotoURL = await uploadProfilePicture(user.uid, avatarFile);
        if (newPhotoURL) {
          uploadedPhotoURL = newPhotoURL;
        } else {
          // Keep existing photoURL if upload fails but don't throw error, or handle as needed
          console.warn("Avatar upload failed, using existing photoURL.");
        }
      }
      
      // Prepare data for update, converting skills string back to array if necessary
      const { email: formEmail, ...updateData } = formDataFromSubmit; // Use formDataFromSubmit
      
      let finalUpdateData: Partial<UserProfile> = { 
        ...updateData, 
        photoURL: uploadedPhotoURL 
      };

      // Skills are already string[] from the form due to schema, or should be handled by Zod transform if input is string
      finalUpdateData.skills = formDataFromSubmit.skills; // Assuming skills is already string[] or undefined
      
      // Ensure userType is not accidentally changed by the form
      if (currentUserProfile?.userType) {
        finalUpdateData.userType = currentUserProfile.userType;
      }


      await updateUserProfileData(user.uid, finalUpdateData as Partial<UserProfile>);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      const dashboardPath = currentUserProfile?.userType === "applicant" 
        ? "/applicant/dashboard" 
        : currentUserProfile?.userType === "restaurant"
        ? "/restaurant/dashboard"
        : "/"; // Fallback
      router.push(dashboardPath);

    } catch (error: any) {
      setFormError(error.message || "Failed to update profile. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/profile/edit");
    }
  }, [authLoading, user, router]);

  if (isLoadingPage || authLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !currentUserProfile) {
     // This case should be handled by the redirect useEffect, but as a fallback:
    return (
      <div className="container py-12 text-center">
        <p>User not found or not authenticated. Redirecting...</p>
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
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <AvatarUpload 
                  currentPhotoURL={currentUserProfile.photoURL || undefined} 
                  onAvatarChange={handleAvatarUpload} 
                  size="lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} disabled /></FormControl>
                    <FormDescription>Email cannot be changed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {currentUserProfile.userType === "applicant" && (
              <Card>
                <CardHeader><CardTitle>Professional Information (Applicant)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea {...field} placeholder="Tell us about yourself..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="skills" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g., Cooking, Serving, Bartending" /></FormControl>
                      <FormDescription>Enter skills separated by commas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="experience" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="preferredLocation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Location</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g., New York, NY" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="education" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g., Culinary Institute of America" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            {currentUserProfile.userType === "restaurant" && (
              <Card>
                <CardHeader><CardTitle>Restaurant Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="businessName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="businessAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="businessDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Description</FormLabel>
                      <FormControl><Textarea {...field} value={field.value || ""} placeholder="Describe your restaurant..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cuisineType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="american">American</SelectItem>
                          <SelectItem value="mexican">Mexican</SelectItem>
                          <SelectItem value="asian">Asian</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
        <Button variant="outline" onClick={handleRefreshProfile} disabled={isRefreshing} className="mt-4">
          {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Profile Data
        </Button>
      </div>
    </>
  );
}