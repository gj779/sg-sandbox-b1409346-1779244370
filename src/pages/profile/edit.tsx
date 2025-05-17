
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Card, 
  CardContent, 
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
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
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
    setIsRefreshing(true);
    try {
      await fetchUserProfile();
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
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      if (avatarFile) {
        const photoURL = await uploadProfilePicture(avatarFile);
        data.photoURL = photoURL;
      }
      
      await updateUserProfileData(data);
      
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
        const userType = currentUserProfile.userType || UserRole.APPLICANT;
        
        // Handle skills array properly
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

  useEffect(() => {
    if (currentUserProfile || !authLoading) {
      setIsLoadingPage(false);
      if (currentUserProfile) {
        const userType = currentUserProfile.userType || UserRole.APPLICANT;
        
        // Handle skills array properly
        let skills: string[] = [];
        if (Array.isArray(currentUserProfile.skills)) {
          skills = currentUserProfile.skills;
        } else if (typeof currentUserProfile.skills === 'string') {
          skills = currentUserProfile.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        form.reset({
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
        });
      }
    }
  }, [currentUserProfile, authLoading, form]);

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
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
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
              </CardContent>
            </Card>

            {currentUserProfile?.userType === UserRole.APPLICANT && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information (Applicant)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Tell us about yourself..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Cooking, Serving, Bartending" />
                        </FormControl>
                        <FormDescription>Enter skills separated by commas.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5+">5+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Location</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., New York, NY" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Culinary Institute of America" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {currentUserProfile?.userType === UserRole.RESTAURANT && (
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Describe your restaurant..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cuisineType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cuisine" />
                            </SelectTrigger>
                          </FormControl>
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
                    )}
                  />
                </CardContent>
              </Card>
            )}

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
