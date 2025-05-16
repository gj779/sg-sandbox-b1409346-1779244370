
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
import { UserProfile } from "@/types";
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
  
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [preferredLocation, setPreferredLocation] = useState("");
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [salary, setSalary] = useState<{
    min?: number;
    max?: number;
    currency?: string;
  }>({
    currency: "USD"
  });

  const isApplicant = userProfile?.userType === "applicant";

  const handleExperienceChange = (value: string) => {
    setExperience([value]);
  };

  const handleEducationChange = (value: string) => {
    setEducation([value]);
  };

  const handleJobTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setJobTypes([...jobTypes, type]);
    } else {
      setJobTypes(jobTypes.filter(t => t !== type));
    }
  };

  const handleLocationChange = (location: string) => {
    setLocations([location]);
  };

  const handleSalaryChange = (field: 'min' | 'max', value: string) => {
    setSalary(prev => ({
      ...prev,
      [field]: value ? Number(value) : undefined
    }));
  };

  // Rest of the component implementation remains the same until the completeOnboarding function

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
            preferences: {
              jobTypes,
              locations,
              salary
            },
            profileComplete: true
          }
        : {
            location: preferredLocation,
            cuisineType: experience[0] || "",
            businessDescription: bio,
            hiringPositions: skills,
            jobTypes,
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

  // Rest of the component implementation remains the same

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
