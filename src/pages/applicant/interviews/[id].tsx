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
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Video, 
  Phone, 
  Building,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
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

// Mock data for interview
const mockInterview = {
  id: "int1",
  jobTitle: "Head Chef",
  restaurantName: "La Bistro Restaurant",
  restaurantAddress: "123 Main St, New York, NY 10001",
  contactPerson: "Jane Smith",
  contactEmail: "jane.smith@labistro.com",
  contactPhone: "+1 (555) 987-6543",
  location: "New York, NY",
  date: new Date("2025-04-05T14:00:00"),
  endTime: new Date("2025-04-05T15:00:00"),
  type: "in-person",
  notes: "Bring your portfolio and be prepared to discuss your experience with French cuisine.",
  status: "upcoming",
  jobDetails: {
    description: "We are looking for an experienced Head Chef to lead our kitchen team and create exceptional French cuisine.",
    requirements: ["Minimum 5 years experience", "Strong leadership skills", "Knowledge of French cuisine", "Menu development experience"],
    salary: "$75,000 - $90,000 per year",
    benefits: ["Health insurance", "Paid time off", "Employee meals", "Professional development"]
  },
  interviewNotes: []
};

export default function InterviewDetailsPage() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const { id } = router.query;
  const [localLoading, setLocalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [interview, setInterview] = useState(mockInterview);
  const [newNote, setNewNote] = useState("");
  const [interviewNotes, setInterviewNotes] = useState<string[]>([]);

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;
    
    // Only redirect if we've finished loading and the user is not authenticated
    if (!isLoading && !isAuthenticated && mounted && !isNavigating) {
      setIsNavigating(true);
      router.push(`/auth/login?redirect=/applicant/interviews/${id}`)
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
      if (path === "/applicant/dashboard" || path.includes("/auth/login")) {
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

  // Format date for display
  const formatDate = (date: Date) => {
    try {
      // Ensure date is valid before formatting
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    try {
      // Ensure date is valid before formatting
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Get interview type badge
  const getInterviewTypeBadge = (type: string) => {
    switch (type) {
      case "in-person":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300">In Person</Badge>;
      case "video":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">Video Call</Badge>;
      case "phone":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300">Phone</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get interview status badge
  const getInterviewStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get interview type icon
  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "in-person":
        return <Building className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Add a new note
  const addNote = () => {
    if (newNote.trim()) {
      setInterviewNotes([...interviewNotes, newNote.trim()]);
      setNewNote("");
    }
  };

  // Show loading state
  if (isLoading || localLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading interview details...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view interview details.</p>
        <Button 
          onClick={() => {
            if (!isNavigating) {
              setIsNavigating(true);
              router.push(`/auth/login?redirect=/applicant/interviews/${id}`)
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
        <title>Interview Details | StaffSpace</title>
        <meta name="description" content="View and manage your interview details on StaffSpace." />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton href="/applicant/interviews" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Interview Details</h1>
              <p className="text-muted-foreground">
                {interview.jobTitle} at {interview.restaurantName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => safeNavigate(`/messaging?conversation=${interview.restaurantName}`)}
              disabled={isNavigating}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Message
            </Button>
            {interview.status === "upcoming" && interview.type !== "in-person" && (
              <Button>
                {getInterviewTypeIcon(interview.type)}
                <span className="ml-2">
                  {interview.type === "video" ? "Join Call" : "Call"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Interview Overview Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold">{interview.jobTitle}</h2>
                  {getInterviewTypeBadge(interview.type)}
                  {getInterviewStatusBadge(interview.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(interview.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(interview.date)} - {formatTime(interview.endTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{interview.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{interview.restaurantName}</span>
                  </div>
                </div>
                {interview.notes && (
                  <div className="mt-2 p-4 bg-muted rounded-md">
                    <h3 className="font-medium mb-2">Interview Instructions</h3>
                    <p>{interview.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="restaurant" className="space-y-6">
          <TabsList>
            <TabsTrigger value="restaurant">Restaurant Details</TabsTrigger>
            <TabsTrigger value="job">Job Details</TabsTrigger>
            <TabsTrigger value="notes">My Notes</TabsTrigger>
          </TabsList>

          {/* Restaurant Details Tab */}
          <TabsContent value="restaurant">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>
                  Details about the restaurant and your contact person
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{interview.restaurantName}</h3>
                    <p className="text-muted-foreground">{interview.restaurantAddress}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Name:</span>
                        <span>{interview.contactPerson}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Email:</span>
                        <span>{interview.contactEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Phone:</span>
                        <span>{interview.contactPhone}</span>
                      </div>
                    </div>
                  </div>
                  
                  {interview.type === "in-person" && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Location Details</h3>
                      <p className="mb-2">{interview.restaurantAddress}</p>
                      <Button variant="outline" size="sm">
                        <MapPin className="mr-2 h-4 w-4" /> Get Directions
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Details Tab */}
          <TabsContent value="job">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>
                  Details about the position you're interviewing for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Job Description</h3>
                    <p>{interview.jobDetails.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {interview.jobDetails.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Salary</h3>
                      <p>{interview.jobDetails.salary}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Benefits</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {interview.jobDetails.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  onClick={() => safeNavigate(`/jobs/${interview.id}`)}
                  disabled={isNavigating}
                >
                  View Full Job Listing
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>My Interview Notes</CardTitle>
                <CardDescription>
                  Add personal notes to help you prepare for the interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviewNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't added any notes yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewNotes.map((note, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <p>{note}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <textarea 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Add a note about this interview..."
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button 
                  className="sm:self-end"
                  onClick={addNote}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}