import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  User, 
  UserPlus, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Save,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define form schemas for different user types
const applicantProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  preferredLocation: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
});

const restaurantProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().optional(),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessAddress: z.string().optional(),
  businessDescription: z.string().optional(),
  cuisineType: z.string().optional(),
});

// Create a union type for the form values
type ProfileFormValues = z.infer<typeof applicantProfileSchema> | z.infer<typeof restaurantProfileSchema>;

export default function EditProfilePage() {
  const { userProfile, updateUserProfile, error, refreshUserProfile } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userType, setUserType] = useState<"applicant" | "restaurant" | "admin" | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  // Determine which schema to use based on user type
  const formSchema = userType === "applicant" 
    ? applicantProfileSchema 
    : restaurantProfileSchema;

  // Initialize form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      // We'll set the type-specific fields in the useEffect
    },
  });

  // Handle refreshing profile data
  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      toast({
        title: "Profile refreshed",
        description: "Your profile data has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load user profile data into form
  useEffect(() => {
    if (userProfile) {
      setIsLoading(false);
      setUserType(userProfile.userType);
      
      try {
        // Common fields - add null checks to prevent undefined errors
        form.setValue('firstName', userProfile.firstName || '');
        form.setValue('lastName', userProfile.lastName || '');
        form.setValue('email', userProfile.email || '');
        form.setValue('phoneNumber', userProfile.phoneNumber || '');
        
        // User type specific fields
        if (userProfile.userType === 'applicant') {
          form.setValue('bio', userProfile.bio || '');
          form.setValue('preferredLocation', userProfile.preferredLocation || '');
          form.setValue('skills', userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.join(', ') : '');
          form.setValue('experience', userProfile.experience || '');
          form.setValue('education', userProfile.education || '');
        } else if (userProfile.userType === 'restaurant') {
          form.setValue('businessName', userProfile.businessName || '');
          form.setValue('businessAddress', userProfile.businessAddress || '');
          form.setValue('businessDescription', userProfile.bio || '');
          form.setValue('cuisineType', userProfile.cuisineType || '');
        }
      } catch (error) {
        console.error('Error setting form values:', error);
        setFormError('Error loading profile data. Please try refreshing the page.');
      }
    } else if (!isLoading) {
      // If we're not loading and there's no profile, there's a problem
      setFormError('Could not load profile data. Please try refreshing or logging in again.');
    }
  }, [userProfile, form, isLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!userProfile && !isLoading) {
        router.push("/auth/login?redirect=/profile/edit");
      }
    }, 1000); // Give it a second to load

    return () => clearTimeout(checkAuth);
  }, [userProfile, isLoading, router]);

  // Set loading state based on auth state
  useEffect(() => {
    if (!userProfile && isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [userProfile, isLoading]);

  // Improve the onSubmit function to handle form submission better
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      if (!userProfile) {
        throw new Error('User profile not found. Please try logging in again.');
      }

      // Prepare update data based on user type
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || '',
      };
      
      // Add user type specific fields
      if (userType === 'applicant') {
        const applicantData = data as z.infer<typeof applicantProfileSchema>;
        updateData.bio = applicantData.bio || '';
        updateData.preferredLocation = applicantData.preferredLocation || '';
        updateData.skills = applicantData.skills ? applicantData.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        updateData.experience = applicantData.experience || '';
        updateData.education = applicantData.education || '';
      } else if (userType === 'restaurant') {
        const restaurantData = data as z.infer<typeof restaurantProfileSchema>;
        updateData.businessName = restaurantData.businessName || '';
        updateData.businessAddress = restaurantData.businessAddress || '';
        updateData.bio = restaurantData.businessDescription || ''; // Map to bio field in the database
        updateData.cuisineType = restaurantData.cuisineType || '';
      }
      
      updateData.userType = userProfile.userType;
      updateData.isActive = userProfile.isActive !== undefined ? userProfile.isActive : true;
      
      // Update profile
      const updatedProfile = await updateUserProfile(updateData);
      
      if (updatedProfile) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
          variant: 'default',
        });
        
        // Redirect to dashboard
        const dashboardPath = userType === 'applicant' 
          ? '/applicant/dashboard' 
          : '/restaurant/dashboard';
        
        router.push(dashboardPath);
      } else {
        throw new Error('Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setFormError(error.message || 'Failed to update profile. Please try again.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profile | StaffSpace</title>
        <meta name="description" content="Update your profile information on StaffSpace" />
      </Head>

      <div className="container max-w-3xl py-8 md:py-12">
        <div className="flex flex-col items-start mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your personal information and preferences
          </p>
        </div>

        {error && (
          <Alert variant="default" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={handleRefreshProfile}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Refresh Profile
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
                <CardDescription>
                  Update your basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
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
                          <Input placeholder="Last name" {...field} />
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
                        <Input placeholder="Email" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Email cannot be changed
                      </FormDescription>
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
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Applicant specific fields */}
            {userType === "applicant" && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>
                    Tell restaurants about your skills and experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell restaurants about yourself..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
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
                          <Input placeholder="e.g., New York, NY" {...field} />
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
                          <Input placeholder="e.g., Cooking, Serving, Bartending (comma separated)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter skills separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-1">Less than 1 year</SelectItem>
                              <SelectItem value="1-3">1-3 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="5+">5+ years</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Input placeholder="e.g., Culinary Institute of America" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Restaurant specific fields */}
            {userType === "restaurant" && (
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                  <CardDescription>
                    Tell job seekers about your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Restaurant name" {...field} />
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
                          <Input placeholder="e.g., 123 Main St, New York, NY" {...field} />
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
                          <Textarea 
                            placeholder="Tell job seekers about your restaurant..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
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
                        <FormControl>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cuisine type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="italian">Italian</SelectItem>
                              <SelectItem value="french">French</SelectItem>
                              <SelectItem value="american">American</SelectItem>
                              <SelectItem value="mexican">Mexican</SelectItem>
                              <SelectItem value="asian">Asian</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
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
                onClick={() => {
                  const dashboardPath = userType === "applicant" 
                    ? "/applicant/dashboard" 
                    : "/restaurant/dashboard";
                  router.push(dashboardPath);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}