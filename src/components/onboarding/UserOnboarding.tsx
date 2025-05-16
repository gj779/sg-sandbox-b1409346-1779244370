
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
import { UserProfile, UserRole } from "@/types";
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
  const [currentStep, setCurrentStep] = useState(0);
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
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [salary, setSalary] = useState<{
    min?: number;
    max?: number;
    currency?: string;
  }>({
    currency: "USD"
  });

  const isApplicant = userProfile?.userType === UserRole.APPLICANT;

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

  const applicantSteps: OnboardingStep[] = [
    {
      title: "Basic Information",
      description: "Tell us about yourself",
      component: (
        <div className="space-y-4">
          <Input
            placeholder="Your preferred location"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
          />
          <Textarea
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      )
    },
    {
      title: "Skills & Experience",
      description: "What are your skills and experience?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["Cooking", "Serving", "Bartending", "Management"].map((skill) => (
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
                />
                <label htmlFor={skill}>{skill}</label>
              </div>
            ))}
          </div>
          <Select onValueChange={handleExperienceChange} value={experience[0]}>
            <SelectTrigger>
              <SelectValue placeholder="Years of experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">Less than 1 year</SelectItem>
              <SelectItem value="1-3">1-3 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      title: "Preferences",
      description: "What type of work are you looking for?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["Full-time", "Part-time", "Temporary"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={type}
                  checked={jobTypes.includes(type)}
                  onChange={(e) => handleJobTypeChange(type, e.target.checked)}
                />
                <label htmlFor={type}>{type}</label>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min salary"
              value={salary.min || ""}
              onChange={(e) => handleSalaryChange("min", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max salary"
              value={salary.max || ""}
              onChange={(e) => handleSalaryChange("max", e.target.value)}
            />
          </div>
        </div>
      )
    }
  ];

  const restaurantSteps: OnboardingStep[] = [
    {
      title: "Restaurant Information",
      description: "Tell us about your restaurant",
      component: (
        <div className="space-y-4">
          <Input
            placeholder="Restaurant name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Input
            placeholder="Restaurant address"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
          />
          <Input
            placeholder="Location"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
          />
          <Select onValueChange={handleExperienceChange} value={experience[0]}>
            <SelectTrigger>
              <SelectValue placeholder="Cuisine type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="italian">Italian</SelectItem>
              <SelectItem value="japanese">Japanese</SelectItem>
              <SelectItem value="mexican">Mexican</SelectItem>
              <SelectItem value="american">American</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Tell us about your restaurant..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      )
    }
  ];

  const steps = isApplicant ? applicantSteps : restaurantSteps;

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
            profileComplete: true,
            userType: UserRole.APPLICANT
          }
        : {
            businessName,
            businessAddress,
            location: preferredLocation,
            cuisineType: experience[0] || "",
            bio,
            skills,
            education,
            profileComplete: true,
            userType: UserRole.RESTAURANT
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
