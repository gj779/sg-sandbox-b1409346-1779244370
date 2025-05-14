import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages, 
  UserPlus, 
  Plus, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Resume, Education, Experience, Certification, Language, Reference } from "@/types";

// Form schemas
const personalInfoSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  address: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string().min(2, { message: "Institution name is required." }),
  degree: z.string().min(2, { message: "Degree is required." }),
  fieldOfStudy: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  isCurrentlyStudying: z.boolean().optional(),
  description: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(2, { message: "Company name is required." }),
  position: z.string().min(2, { message: "Position is required." }),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  isCurrentlyWorking: z.boolean().optional(),
  description: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(2, { message: "Certification name is required." }),
  issuingOrganization: z.string().min(2, { message: "Issuing organization is required." }),
  issueDate: z.date(),
  expirationDate: z.date().optional(),
  credentialID: z.string().optional(),
  credentialURL: z.string().optional(),
});

const languageSchema = z.object({
  language: z.string().min(2, { message: "Language is required." }),
  proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Fluent", "Native"]),
});

const referenceSchema = z.object({
  name: z.string().min(2, { message: "Reference name is required." }),
  company: z.string().min(2, { message: "Company is required." }),
  position: z.string().min(2, { message: "Position is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  phone: z.string().optional(),
  relationship: z.string().min(2, { message: "Relationship is required." }),
});

export default function CreateResumePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState<Partial<Resume>>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    languages: [],
    references: [],
  });

  // Personal Info form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: resume.personalInfo?.fullName || "",
      email: resume.personalInfo?.email || "",
      phone: resume.personalInfo?.phone || "",
      address: resume.personalInfo?.address || "",
    },
  });

  // Skills state
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(resume.skills || []);

  // Education state
  const [educations, setEducations] = useState<Partial<Education>[]>(resume.education || []);
  const [currentEducation, setCurrentEducation] = useState<Partial<Education>>({});
  const [isAddingEducation, setIsAddingEducation] = useState(false);

  // Experience state
  const [experiences, setExperiences] = useState<Partial<Experience>[]>(resume.experience || []);
  const [currentExperience, setCurrentExperience] = useState<Partial<Experience>>({});
  const [isAddingExperience, setIsAddingExperience] = useState(false);

  // Certification state
  const [certifications, setCertifications] = useState<Partial<Certification>[]>(resume.certifications || []);
  const [currentCertification, setCurrentCertification] = useState<Partial<Certification>>({});
  const [isAddingCertification, setIsAddingCertification] = useState(false);

  // Language state
  const [languages, setLanguages] = useState<Partial<Language>[]>(resume.languages || []);
  const [currentLanguage, setCurrentLanguage] = useState<Partial<Language>>({});
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  // Reference state
  const [references, setReferences] = useState<Partial<Reference>[]>(resume.references || []);
  const [currentReference, setCurrentReference] = useState<Partial<Reference>>({});
  const [isAddingReference, setIsAddingReference] = useState(false);

  const steps = [
    { title: "Personal Info", icon: <UserPlus className="h-4 w-4" /> },
    { title: "Education", icon: <GraduationCap className="h-4 w-4" /> },
    { title: "Experience", icon: <Briefcase className="h-4 w-4" /> },
    { title: "Skills & Certifications", icon: <Award className="h-4 w-4" /> },
    { title: "Languages & References", icon: <Languages className="h-4 w-4" /> },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      personalInfoForm.handleSubmit((data) => {
        setResume((prev) => ({
          ...prev,
          personalInfo: data,
        }));
        setCurrentStep(currentStep + 1);
      })();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Placeholder functions for edit handlers
  const handleEditEducation = (index: number) => {
    console.log("Attempting to edit education at index:", index);
    // In a real implementation, you would likely:
    // 1. Set the `currentEducation` state to `educations[index]`.
    // 2. Set `isAddingEducation` to true (or a new state like `isEditingEducation` to true).
    // 3. Potentially store the index of the item being edited.
    // The form would then populate with this data, and saving would update the item at the stored index.
  };

  const handleEditExperience = (index: number) => {
    console.log("Attempting to edit experience at index:", index);
    // Similar logic to handleEditEducation
  };

  const handleEditCertification = (index: number) => {
    console.log("Attempting to edit certification at index:", index);
    // Similar logic to handleEditEducation
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Combine all data
    const completeResume: Partial<Resume> = {
      ...resume,
      skills,
      education: educations as Education[],
      experience: experiences as Experience[],
      certifications: certifications as Certification[],
      languages: languages as Language[],
      references: references as Reference[],
    };
    
    // In a real app, this would save to Firebase
    console.log('Resume data:', completeResume);
    
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/applicant/dashboard');
    }, 1500);
  };

  const handleSkipResume = () => {
    router.push("/applicant/dashboard");
  };

  return (
    <>
      <Head>
        <title>Create Resume | StaffSpace</title>
        <meta name="description" content="Create your professional resume to apply for restaurant jobs." />
      </Head>

      <div className="container max-w-3xl py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Resume</h1>
          <p className="text-muted-foreground mt-2">Build a professional resume to showcase your skills and experience</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-xs hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 h-1 bg-muted w-full rounded-full"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Enter your personal information"}
              {currentStep === 1 && "Add your educational background"}
              {currentStep === 2 && "Add your work experience"}
              {currentStep === 3 && "List your skills and certifications"}
              {currentStep === 4 && "Add languages you speak and professional references"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <Form {...personalInfoForm}>
                <form className="space-y-4">
                  <FormField
                    control={personalInfoForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalInfoForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalInfoForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}

            {/* Step 2: Education */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {educations.length > 0 ? (
                  <div className="space-y-4">
                    {educations.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{edu.degree}</h3>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            <div className="text-sm">
                              {edu.startDate ? (
                                typeof edu.startDate === 'string' ? new Date(edu.startDate).toLocaleDateString() : edu.startDate.toLocaleDateString()
                              ) : 'N/A'}
                               - 
                              {edu.isCurrentlyStudying 
                                ? "Present" 
                                : edu.endDate 
                                  ? (typeof edu.endDate === 'string' ? new Date(edu.endDate).toLocaleDateString() : edu.endDate.toLocaleDateString())
                                  : 'N/A'}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleEditEducation(index)}>Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No education added yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Add your educational background to showcase your qualifications.
                    </p>
                  </div>
                )}

                {isAddingEducation ? (
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Add Education</h3>
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Institution</FormLabel>
                        <Input 
                          placeholder="University or School Name"
                          value={currentEducation.institution || ""}
                          onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                        />
                      </div>
                      <div>
                        <FormLabel>Degree</FormLabel>
                        <Input 
                          placeholder="Bachelor of Arts, High School Diploma, etc."
                          value={currentEducation.degree || ""}
                          onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                        />
                      </div>
                      <div>
                        <FormLabel>Field of Study (Optional)</FormLabel>
                        <Input 
                          placeholder="Culinary Arts, Business, etc."
                          value={currentEducation.fieldOfStudy || ""}
                          onChange={(e) => setCurrentEducation({...currentEducation, fieldOfStudy: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Start Date</FormLabel>
                          <Input 
                            type="date"
                            value={currentEducation.startDate ? new Date(currentEducation.startDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => setCurrentEducation({
                              ...currentEducation, 
                              startDate: new Date(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <FormLabel>End Date</FormLabel>
                          <Input 
                            type="date"
                            disabled={currentEducation.isCurrentlyStudying}
                            value={currentEducation.endDate && !currentEducation.isCurrentlyStudying 
                              ? new Date(currentEducation.endDate).toISOString().split('T')[0] 
                              : ""}
                            onChange={(e) => setCurrentEducation({
                              ...currentEducation, 
                              endDate: new Date(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="currently-studying"
                          checked={currentEducation.isCurrentlyStudying || false}
                          onCheckedChange={(checked) => setCurrentEducation({
                            ...currentEducation,
                            isCurrentlyStudying: checked as boolean,
                            endDate: undefined
                          })}
                        />
                        <label 
                          htmlFor="currently-studying"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I am currently studying here
                        </label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingEducation(false);
                            setCurrentEducation({});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            if (currentEducation.institution && 
                                currentEducation.degree && 
                                currentEducation.startDate) {
                              setEducations([...educations, currentEducation as Education]);
                              setCurrentEducation({});
                              setIsAddingEducation(false);
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsAddingEducation(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Education
                  </Button>
                )}
              </div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {experiences.length > 0 ? (
                  <div className="space-y-4">
                    {experiences.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{exp.position}</h3>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                            {exp.location && (
                              <p className="text-xs text-muted-foreground">{exp.location}</p>
                            )}
                            <div className="text-sm">
                              {exp.startDate ? (
                                typeof exp.startDate === 'string' ? new Date(exp.startDate).toLocaleDateString() : exp.startDate.toLocaleDateString()
                              ) : 'N/A'}
                               - 
                              {exp.isCurrentlyWorking 
                                ? "Present" 
                                : exp.endDate 
                                  ? (typeof exp.endDate === 'string' ? new Date(exp.endDate).toLocaleDateString() : exp.endDate.toLocaleDateString())
                                  : 'N/A'}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleEditExperience(index)}>Edit</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No experience added yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Add your work experience to showcase your skills and expertise.
                    </p>
                  </div>
                )}

                {isAddingExperience ? (
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Add Experience</h3>
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Company</FormLabel>
                        <Input 
                          placeholder="Company Name"
                          value={currentExperience.company || ""}
                          onChange={(e) => setCurrentExperience({...currentExperience, company: e.target.value})}
                        />
                      </div>
                      <div>
                        <FormLabel>Position</FormLabel>
                        <Input 
                          placeholder="Your Job Title"
                          value={currentExperience.position || ""}
                          onChange={(e) => setCurrentExperience({...currentExperience, position: e.target.value})}
                        />
                      </div>
                      <div>
                        <FormLabel>Location (Optional)</FormLabel>
                        <Input 
                          placeholder="City, State, Country"
                          value={currentExperience.location || ""}
                          onChange={(e) => setCurrentExperience({...currentExperience, location: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Start Date</FormLabel>
                          <Input 
                            type="date"
                            value={currentExperience.startDate ? new Date(currentExperience.startDate).toISOString().split('T')[0] : ""}
                            onChange={(e) => setCurrentExperience({
                              ...currentExperience, 
                              startDate: new Date(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <FormLabel>End Date</FormLabel>
                          <Input 
                            type="date"
                            disabled={currentExperience.isCurrentlyWorking}
                            value={currentExperience.endDate && !currentExperience.isCurrentlyWorking 
                              ? new Date(currentExperience.endDate).toISOString().split('T')[0] 
                              : ""}
                            onChange={(e) => setCurrentExperience({
                              ...currentExperience, 
                              endDate: new Date(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="currently-working"
                          checked={currentExperience.isCurrentlyWorking || false}
                          onCheckedChange={(checked) => setCurrentExperience({
                            ...currentExperience,
                            isCurrentlyWorking: checked as boolean,
                            endDate: undefined
                          })}
                        />
                        <label 
                          htmlFor="currently-working"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I currently work here
                        </label>
                      </div>
                      <div>
                        <FormLabel>Description (Optional)</FormLabel>
                        <Textarea 
                          placeholder="Describe your responsibilities and achievements"
                          value={currentExperience.description || ""}
                          onChange={(e) => setCurrentExperience({...currentExperience, description: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingExperience(false);
                            setCurrentExperience({});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => {
                            if (currentExperience.company && 
                                currentExperience.position && 
                                currentExperience.startDate) {
                              setExperiences([...experiences, currentExperience as Experience]);
                              setCurrentExperience({});
                              setIsAddingExperience(false);
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsAddingExperience(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                )}
              </div>
            )}

            {/* Step 4: Skills & Certifications */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{skill}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0" 
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a skill (e.g., Cooking, Bartending, Customer Service)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button onClick={handleAddSkill}>Add</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Certifications</h3>
                  {certifications.length > 0 ? (
                    <div className="space-y-4">
                      {certifications.map((cert, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                              <p className="text-sm text-muted-foreground">
                                Issued: {cert.issueDate ? (typeof cert.issueDate === 'string' ? new Date(cert.issueDate).toLocaleDateString() : cert.issueDate.toLocaleDateString()) : 'N/A'}
                                {cert.expirationDate && `, Expires: ${typeof cert.expirationDate === 'string' ? new Date(cert.expirationDate).toLocaleDateString() : cert.expirationDate.toLocaleDateString()}`}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEditCertification(index)}>Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No certifications added yet</h3>
                      <p className="mt-2 text-muted-foreground">
                        Add your certifications to showcase your qualifications.
                      </p>
                    </div>
                  )}

                  {isAddingCertification ? (
                    <div className="border rounded-lg p-4 space-y-4 mt-4">
                      <h3 className="font-medium">Add Certification</h3>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Certification Name</FormLabel>
                          <Input 
                            placeholder="e.g., Food Handler's Certificate"
                            value={currentCertification.name || ""}
                            onChange={(e) => setCurrentCertification({...currentCertification, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <FormLabel>Issuing Organization</FormLabel>
                          <Input 
                            placeholder="e.g., ServSafe, American Culinary Federation"
                            value={currentCertification.issuingOrganization || ""}
                            onChange={(e) => setCurrentCertification({...currentCertification, issuingOrganization: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Issue Date</FormLabel>
                            <Input 
                              type="date"
                              value={currentCertification.issueDate ? new Date(currentCertification.issueDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => setCurrentCertification({
                                ...currentCertification, 
                                issueDate: new Date(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <FormLabel>Expiration Date (Optional)</FormLabel>
                            <Input 
                              type="date"
                              value={currentCertification.expirationDate ? new Date(currentCertification.expirationDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => setCurrentCertification({
                                ...currentCertification, 
                                expirationDate: new Date(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingCertification(false);
                              setCurrentCertification({});
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (currentCertification.name && 
                                  currentCertification.issuingOrganization && 
                                  currentCertification.issueDate) {
                                setCertifications([...certifications, currentCertification as Certification]);
                                setCurrentCertification({});
                                setIsAddingCertification(false);
                              }
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4" 
                      onClick={() => setIsAddingCertification(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Certification
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Languages & References */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Languages</h3>
                  {languages.length > 0 ? (
                    <div className="space-y-4">
                      {languages.map((lang, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{lang.language}</h3>
                              <p className="text-sm text-muted-foreground">{lang.proficiency}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setLanguages(languages.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Languages className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No languages added yet</h3>
                      <p className="mt-2 text-muted-foreground">
                        Add languages you speak to showcase your communication skills.
                      </p>
                    </div>
                  )}

                  {isAddingLanguage ? (
                    <div className="border rounded-lg p-4 space-y-4 mt-4">
                      <h3 className="font-medium">Add Language</h3>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Language</FormLabel>
                          <Input 
                            placeholder="e.g., English, Spanish, French"
                            value={currentLanguage.language || ""}
                            onChange={(e) => setCurrentLanguage({...currentLanguage, language: e.target.value})}
                          />
                        </div>
                        <div>
                          <FormLabel>Proficiency</FormLabel>
                          <Select 
                            value={currentLanguage.proficiency} 
                            onValueChange={(value) => setCurrentLanguage({
                              ...currentLanguage, 
                              proficiency: value as "Beginner" | "Intermediate" | "Advanced" | "Fluent" | "Native"
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select proficiency level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Fluent">Fluent</SelectItem>
                              <SelectItem value="Native">Native</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingLanguage(false);
                              setCurrentLanguage({});
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (currentLanguage.language && currentLanguage.proficiency) {
                                setLanguages([...languages, currentLanguage as Language]);
                                setCurrentLanguage({});
                                setIsAddingLanguage(false);
                              }
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4" 
                      onClick={() => setIsAddingLanguage(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Language
                    </Button>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">References (Optional)</h3>
                  {references.length > 0 ? (
                    <div className="space-y-4">
                      {references.map((ref, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{ref.name}</h3>
                              <p className="text-sm text-muted-foreground">{ref.position} at {ref.company}</p>
                              <p className="text-xs text-muted-foreground">{ref.relationship}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setReferences(references.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No references added yet</h3>
                      <p className="mt-2 text-muted-foreground">
                        Add professional references to strengthen your application.
                      </p>
                    </div>
                  )}

                  {isAddingReference ? (
                    <div className="border rounded-lg p-4 space-y-4 mt-4">
                      <h3 className="font-medium">Add Reference</h3>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Name</FormLabel>
                          <Input 
                            placeholder="Reference's full name"
                            value={currentReference.name || ""}
                            onChange={(e) => setCurrentReference({...currentReference, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Company</FormLabel>
                            <Input 
                              placeholder="Company name"
                              value={currentReference.company || ""}
                              onChange={(e) => setCurrentReference({...currentReference, company: e.target.value})}
                            />
                          </div>
                          <div>
                            <FormLabel>Position</FormLabel>
                            <Input 
                              placeholder="Job title"
                              value={currentReference.position || ""}
                              onChange={(e) => setCurrentReference({...currentReference, position: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Email (Optional)</FormLabel>
                            <Input 
                              type="email"
                              placeholder="Email address"
                              value={currentReference.email || ""}
                              onChange={(e) => setCurrentReference({...currentReference, email: e.target.value})}
                            />
                          </div>
                          <div>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <Input 
                              placeholder="Phone number"
                              value={currentReference.phone || ""}
                              onChange={(e) => setCurrentReference({...currentReference, phone: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <FormLabel>Relationship</FormLabel>
                          <Input 
                            placeholder="e.g., Manager, Colleague, Mentor"
                            value={currentReference.relationship || ""}
                            onChange={(e) => setCurrentReference({...currentReference, relationship: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingReference(false);
                              setCurrentReference({});
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => {
                              if (currentReference.name && 
                                  currentReference.company && 
                                  currentReference.position &&
                                  currentReference.relationship) {
                                setReferences([...references, currentReference as Reference]);
                                setCurrentReference({});
                                setIsAddingReference(false);
                              }
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4" 
                      onClick={() => setIsAddingReference(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Reference
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {currentStep === 0 ? (
                <Button variant="ghost" onClick={handleSkipResume}>
                  Skip for now
                </Button>
              ) : (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>
            <div>
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Resume"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}