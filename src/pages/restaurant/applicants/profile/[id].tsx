import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  Download,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Star,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import BackButton from "@/components/common/BackButton";
import ErrorBoundary from "@/utils/errorBoundary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for applicant
const mockApplicant = {
  id: "1",
  name: "John Doe",
  position: "Head Chef",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "New York, NY",
  experience: "8 years",
  appliedDate: new Date("2025-03-21"),
  status: "Reviewed",
  matchScore: 95,
  hasResume: true,
  coverLetter: "I am excited to apply for the Head Chef position at La Bistro. With 8 years of experience in French cuisine, I have developed a strong foundation in classic techniques while also exploring innovative approaches to modern dining. My previous role as Sous Chef at Le Petit Bistro allowed me to refine my skills in menu development, kitchen management, and staff training.\n\nI am particularly drawn to La Bistro's commitment to locally-sourced ingredients and seasonal menus, which aligns perfectly with my culinary philosophy. I believe that the best dishes come from the freshest ingredients, treated with respect and prepared with precision.\n\nIn my current position, I have successfully reduced food costs by 15% while maintaining the highest quality standards. I have also implemented a comprehensive training program for junior staff, resulting in improved efficiency and consistency.\n\nI am excited about the possibility of bringing my passion, creativity, and leadership to La Bistro and would welcome the opportunity to discuss how my experience and vision align with your needs.",
  skills: ["French Cuisine", "Menu Development", "Team Management", "Food Presentation", "Inventory Control", "Staff Training", "Cost Management", "Wine Pairing"],
  availability: {
    monday: { morning: true, afternoon: true, evening: true },
    tuesday: { morning: true, afternoon: true, evening: true },
    wednesday: { morning: true, afternoon: true, evening: true },
    thursday: { morning: true, afternoon: true, evening: true },
    friday: { morning: true, afternoon: true, evening: true },
    saturday: { morning: false, afternoon: true, evening: true },
    sunday: { morning: false, afternoon: false, evening: false }
  },
  education: [
    {
      institution: "Culinary Institute of America",
      degree: "Associate Degree in Culinary Arts",
      year: "2017"
    },
    {
      institution: "French Culinary Institute",
      degree: "Advanced Certificate in French Cuisine",
      year: "2019"
    }
  ],
  workHistory: [
    {
      company: "Le Petit Bistro",
      position: "Sous Chef",
      startDate: "2021-06",
      endDate: "Present",
      description: "Managed kitchen operations, developed seasonal menus, and trained junior staff. Reduced food costs by 15% while maintaining quality standards."
    },
    {
      company: "Chez Michel",
      position: "Line Cook",
      startDate: "2019-03",
      endDate: "2021-05",
      description: "Prepared dishes for a high-volume French restaurant. Specialized in sauces and protein preparation."
    },
    {
      company: "The Grand Hotel",
      position: "Commis Chef",
      startDate: "2017-09",
      endDate: "2019-02",
      description: "Assisted in various kitchen stations, including garde manger, pastry, and hot line."
    }
  ],
  certifications: [
    "ServSafe Food Protection Manager Certification",
    "Wine & Spirit Education Trust (WSET) Level 2",
    "Certified Culinary Professional (CCP)"
  ],
  references: [
    {
      name: "Chef Michel Dubois",
      position: "Executive Chef at Le Petit Bistro",
      contact: "Available upon request"
    },
    {
      name: "Chef Sarah Johnson",
      position: "Culinary Director at The Grand Hotel",
      contact: "Available upon request"
    }
  ],
  notes: []
};

// Mock data for job
const mockJob = {
  id: "1",
  title: "Head Chef",
  restaurantName: "La Bistro",
  location: "New York, NY"
};

export default function ApplicantProfilePage() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [localLoading, setLocalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [applicant, setApplicant] = useState(mockApplicant);
  const [job, setJob] = useState(mockJob);
  const [notes, setNotes] = useState<string[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;
    
    // Only redirect if we've finished loading and the user is not authenticated
    if (!isLoading && !isAuthenticated && mounted && !isNavigating) {
      setIsNavigating(true);
      router.push(`/auth/login?redirect=/restaurant/applicants/profile/${id}`)
        .catch(err => {
          console.error("Navigation error:", err);
          if (mounted) setIsNavigating(false);
        });
    }
    
    // Set local loading state based on auth loading
    if (!isLoading && mounted) {
      setLocalLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, router, isNavigating, id]);

  // Safe navigation function
  const safeNavigate = (path: string) => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      
      // Use direct window.location for critical paths to avoid router issues
      if (path === "/restaurant/dashboard" || path.includes("/auth/login")) {
        window.location.href = path;
        return;
      }
      
      router.push(path)
        .then(() => {
          // Navigation successful
          console.log(`Navigation to ${path} successful`);
        })
        .catch(err => {
          console.error(`Navigation error for path ${path}:`, err);
          setIsNavigating(false);
        });
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) return "Invalid date";
      
      const dateObj = typeof date === "string" ? new Date(date) : date;
      
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formatWorkDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      
      if (dateStr === "Present") return "Present";
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric"
      }).format(date);
    } catch (error) {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-gray-600";
  };

  // Show loading state
  if (isLoading || localLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading applicant profile...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view applicant profiles.</p>
        <Button 
          onClick={() => {
            if (!isNavigating) {
              setIsNavigating(true);
              router.push(`/auth/login?redirect=/restaurant/applicants/profile/${id}`)
                .catch(err => {
                  console.error("Navigation error:", err);
                  setIsNavigating(false);
                });
            }
          }}
          disabled={isNavigating}
        >
          {isNavigating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Head>
        <title>{applicant.name} | Applicant Profile | StaffSpace</title>
        <meta name="description" content={`View ${applicant.name}'s profile and application details.`} />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton href={`/restaurant/applicants/${job.id}`} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Applicant Profile</h1>
              <p className="text-muted-foreground">
                Reviewing application for {job.title} at {job.restaurantName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Mark as Shortlisted
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4 text-blue-500" />
                  Mark as Reviewed
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  Reject Application
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => safeNavigate(`/messaging?conversation=${applicant.name}`)}
              disabled={isNavigating}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
          </div>
        </div>

        {/* Applicant Overview Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full">
                <User className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{applicant.name}</h2>
                  <Badge className={getStatusColor(applicant.status)}>
                    {applicant.status}
                  </Badge>
                  <div className={`text-sm font-medium ${getMatchScoreColor(applicant.matchScore)}`}>
                    {applicant.matchScore}% Match
                  </div>
                </div>
                <p className="text-xl text-muted-foreground mb-4">{applicant.position}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{applicant.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{applicant.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{applicant.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{applicant.experience} experience</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Applied {formatDate(applicant.appliedDate)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 self-end md:self-start">
                {applicant.hasResume && (
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {applicant.workHistory.map((work, index) => (
                        <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                            <div>
                              <h3 className="font-medium">{work.position}</h3>
                              <p className="text-muted-foreground">{work.company}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatWorkDate(work.startDate)} - {formatWorkDate(work.endDate)}
                            </div>
                          </div>
                          <p className="text-sm">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applicant.education.map((edu, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            <div>
                              <h3 className="font-medium">{edu.degree}</h3>
                              <p className="text-muted-foreground">{edu.institution}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {edu.year}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {applicant.certifications.map((cert, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applicant.references.map((ref, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <h3 className="font-medium">{ref.name}</h3>
                          <p className="text-sm text-muted-foreground">{ref.position}</p>
                          <p className="text-sm mt-1">{ref.contact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover-letter">
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  {applicant.coverLetter.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4 text-center">
                  {Object.entries(applicant.availability).map(([day, shifts]) => (
                    <div key={day} className="border rounded-md p-4">
                      <h3 className="font-medium capitalize mb-2">{day}</h3>
                      <div className="space-y-2 text-sm">
                        <div className={`p-2 rounded-md ${shifts.morning ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                          Morning
                        </div>
                        <div className={`p-2 rounded-md ${shifts.afternoon ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                          Afternoon
                        </div>
                        <div className={`p-2 rounded-md ${shifts.evening ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                          Evening
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Interview Notes & Comments</CardTitle>
                <CardDescription>
                  Add notes about this applicant for your team to reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No notes have been added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <p>{note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <textarea 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Add a note about this applicant..."
                  rows={3}
                />
                <Button className="ml-4">Add Note</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}