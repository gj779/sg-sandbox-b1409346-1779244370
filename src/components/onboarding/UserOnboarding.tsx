import { useState } from "react";
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { UserProfile } from "@/types"; // Import UserProfile
import { 
  CheckCircle2, 
  ChefHat, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  ArrowRight 
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  component: React.ReactNode;
}

export default function UserOnboarding() {
  const { user, userProfile, updateUserProfileData, isLoading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [preferredLocation, setPreferredLocation] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [jobPreferences, setJobPreferences] = useState<string[]>([]);

  const isApplicant = userProfile?.userType === "applicant";
  
  // Define onboarding steps based on user type
  const applicantSteps: OnboardingStep[] = [
    {
      title: "Tell us about your skills",
      description: "Select skills that best describe your expertise in the restaurant industry",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["Cooking", "Serving", "Bartending", "Hosting", "Management", "Dishwashing", "Food Prep", "Catering"].map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={skill}
                  checked={skills.includes(skill)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSkills([...skills, skill]);
                    } else {
                      setSkills(skills.filter(s => s !== skill));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={skill} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {skill}
                </label>
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium mb-1">Years of Experience</label>
            <Select value={experience} onValueChange={setExperience}>
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
          </div>
        </div>
      )
    },
    {
      title: "Your availability",
      description: "Let restaurants know when you're available to work",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={day}
                  checked={availability.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAvailability([...availability, day]);
                    } else {
                      setAvailability(availability.filter(d => d !== day));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={day} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {day}
                </label>
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="jobPreferences" className="block text-sm font-medium mb-1">Job Preferences</label>
            <div className="grid grid-cols-2 gap-2">
              {["Full-time", "Part-time", "Temporary", "Seasonal", "Event"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={type}
                    checked={jobPreferences.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setJobPreferences([...jobPreferences, type]);
                      } else {
                        setJobPreferences(jobPreferences.filter(t => t !== type));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Additional information",
      description: "Help us personalize your job search experience",
      component: (
        <div className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Preferred Location</label>
            <Input
              id="location"
              placeholder="e.g., New York, NY"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="education" className="block text-sm font-medium mb-1">Education (Optional)</label>
            <Input
              id="education"
              placeholder="e.g., Culinary Institute of America"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">Short Bio</label>
            <Textarea
              id="bio"
              placeholder="Tell restaurants a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )
    }
  ];

  // Restaurant onboarding steps
  const restaurantSteps: OnboardingStep[] = [
    {
      title: "Tell us about your restaurant",
      description: "Help job seekers learn more about your establishment",
      component: (
        <div className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Restaurant Location</label>
            <Input
              id="location"
              placeholder="e.g., 123 Main St, New York, NY"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cuisineType" className="block text-sm font-medium mb-1">Cuisine Type</label>
            <Select value={experience} onValueChange={setExperience}>
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
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">Restaurant Description</label>
            <Textarea
              id="bio"
              placeholder="Tell job seekers about your restaurant..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )
    },
    {
      title: "Hiring needs",
      description: "What positions are you typically hiring for?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["Chef", "Line Cook", "Server", "Host/Hostess", "Bartender", "Manager", "Dishwasher", "Busser"].map((position) => (
              <div key={position} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={position}
                  checked={skills.includes(position)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSkills([...skills, position]);
                    } else {
                      setSkills(skills.filter(s => s !== position));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={position} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {position}
                </label>
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="jobTypes" className="block text-sm font-medium mb-1">Job Types You Offer</label>
            <div className="grid grid-cols-2 gap-2">
              {["Full-time", "Part-time", "Temporary", "Seasonal", "Event"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={type}
                    checked={jobPreferences.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setJobPreferences([...jobPreferences, type]);
                      } else {
                        setJobPreferences(jobPreferences.filter(t => t !== type));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Additional information",
      description: "Help us connect you with the right candidates",
      component: (
        <div className="space-y-4">
          <div>
            <label htmlFor="benefits" className="block text-sm font-medium mb-1">Benefits Offered (Optional)</label>
            <Textarea
              id="benefits"
              placeholder="e.g., Health insurance, paid time off, flexible scheduling..."
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div>
            <label htmlFor="companyValues" className="block text-sm font-medium mb-1">Company Values</label>
            <Textarea
              id="companyValues"
              placeholder="Tell job seekers what your restaurant values..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )
    }
  ];

  const steps = isApplicant ? applicantSteps : restaurantSteps;

  const handleNext = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      if (user?.uid) {
        const finalData = { ...formData, profileComplete: true };
        await updateUserProfileData(user.uid, finalData); 
        if (userProfile?.userType === "applicant") {
          router.push("/applicant/dashboard");
        } else if (userProfile?.userType === "restaurant") {
          router.push("/restaurant/dashboard");
        } else {
          router.push("/"); 
        }
      } else {
        setError("User not authenticated. Cannot proceed.");
        throw new Error("User not found.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    
    try {
      if (!user?.uid) {
        setError("User not authenticated. Cannot complete onboarding.");
        throw new Error("User not authenticated.");
      }
      const onboardingData: Partial<UserProfile> = isApplicant 
        ? {
            skills,
            experience,
            availability,
            preferredLocation,
            bio,
            education,
            jobPreferences,
            profileComplete: true
          }
        : {
            location: preferredLocation,
            cuisineType: experience,
            businessDescription: bio,
            hiringPositions: skills,
            jobTypes: jobPreferences,
            benefits: education,
            profileComplete: true
          };
      
      await updateUserProfileData(user.uid, onboardingData); 
      
      toast({
        title: "Onboarding completed!",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
      
      router.push(isApplicant ? "/applicant/dashboard" : "/restaurant/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const skipOnboarding = async () => {
    try {
      if (!user?.uid) {
        setError("User not authenticated. Cannot skip onboarding.");
        throw new Error("User not authenticated.");
      }
      await updateUserProfileData(user.uid, { profileComplete: true });
      router.push(isApplicant ? "/applicant/dashboard" : "/restaurant/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      setError("Failed to skip onboarding. Please try again.");
    }
  };

  return (
    <>
      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
              <div className="flex items-center space-x-1">
                {steps.map((_, index) => (
                  <span 
                    key={index} 
                    className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-primary' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {steps[currentStep].component}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {currentStep > 0 ? (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={skipOnboarding}>
                  Skip for now
                </Button>
              )}
            </div>
            <Button onClick={handleNext} disabled={isCompleting}>
              {currentStep === steps.length - 1 ? (
                isCompleting ? "Completing..." : "Complete"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Welcome dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to StaffSpace!</DialogTitle>
            <DialogDescription>
              Let's set up your profile to help you {isApplicant ? "find the perfect job" : "find the right staff"}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 mb-4">
              {isApplicant ? (
                <Briefcase className="h-10 w-10 text-primary" />
              ) : (
                <ChefHat className="h-10 w-10 text-primary" />
              )}
              <div>
                <h3 className="font-medium">Complete your profile</h3>
                <p className="text-sm text-muted-foreground">
                  {isApplicant 
                    ? "Tell us about your skills and preferences to find matching jobs."
                    : "Tell job seekers about your restaurant and hiring needs."
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <div>
                <h3 className="font-medium">Get personalized recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  {isApplicant 
                    ? "We'll match you with jobs that fit your skills and availability."
                    : "We'll help you find qualified candidates for your positions."
                  }
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={skipOnboarding}>Skip for now</Button>
            <Button onClick={() => setShowWelcomeDialog(false)}>Let's get started</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}