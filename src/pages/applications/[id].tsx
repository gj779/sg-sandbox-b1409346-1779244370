import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Building,
  MessageSquare,
  FileText,
  ChevronLeft,
  XCircle,
  Clock3,
  CalendarClock,
  ThumbsUp,
  ArrowLeft,
  User,
  Mail,
  Phone,
  File,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Separator } from "@/components/ui/separator";

// Application status types
type ApplicationStatus = 
  | "applied" 
  | "viewed" 
  | "in_review" 
  | "interview_scheduled" 
  | "offered" 
  | "rejected" 
  | "withdrawn";

// Mock application data - this would normally come from Firebase
const mockApplications = [
  {
    id: "app1",
    jobId: "job-1",
    jobTitle: "Head Chef",
    restaurantName: "La Bistro Restaurant",
    restaurantLogo: null,
    location: "New York, NY",
    appliedDate: new Date("2025-03-20"),
    status: "interview_scheduled" as ApplicationStatus,
    interviewDate: new Date("2025-04-05T14:00:00"),
    notes: "Interview scheduled with Executive Chef and Restaurant Manager",
    hasUnreadMessages: true,
    salary: "$65,000 - $80,000 per year",
    jobType: "Full-time",
    jobDescription: "We are looking for an experienced Head Chef to lead our kitchen team and create exceptional dining experiences for our guests.",
    applicationHistory: [
      { date: new Date("2025-03-20"), status: "applied", note: "Application submitted" },
      { date: new Date("2025-03-22"), status: "viewed", note: "Application viewed by employer" },
      { date: new Date("2025-03-25"), status: "in_review", note: "Application under review" },
      { date: new Date("2025-03-28"), status: "interview_scheduled", note: "Interview scheduled for April 5th" }
    ],
    resume: {
      url: "#",
      name: "john_doe_resume.pdf"
    },
    coverLetter: {
      url: "#",
      name: "john_doe_cover_letter.pdf"
    }
  },
  {
    id: "app2",
    jobId: "job-2",
    jobTitle: "Server",
    restaurantName: "Coastal Kitchen",
    restaurantLogo: null,
    location: "Miami, FL",
    appliedDate: new Date("2025-03-22"),
    status: "in_review" as ApplicationStatus,
    notes: "Application under review by hiring manager",
    hasUnreadMessages: false,
    salary: "$15 - $25 per hour + tips",
    jobType: "Full-time",
    jobDescription: "Join our team as a Server at Coastal Kitchen, where you'll provide exceptional service to our guests in a fast-paced environment.",
    applicationHistory: [
      { date: new Date("2025-03-22"), status: "applied", note: "Application submitted" },
      { date: new Date("2025-03-24"), status: "viewed", note: "Application viewed by employer" },
      { date: new Date("2025-03-26"), status: "in_review", note: "Application under review" }
    ],
    resume: {
      url: "#",
      name: "john_doe_resume.pdf"
    },
    coverLetter: null
  },
  {
    id: "app3",
    jobId: "3",
    jobTitle: "Bartender",
    restaurantName: "The Speakeasy",
    restaurantLogo: null,
    location: "Chicago, IL",
    appliedDate: new Date("2025-03-15"),
    status: "viewed" as ApplicationStatus,
    notes: "Application viewed by employer",
    hasUnreadMessages: false,
    salary: "$18 - $30 per hour + tips",
    jobType: "Part-time",
    jobDescription: "We're seeking an experienced Bartender to join our team at The Speakeasy, a popular cocktail bar in downtown Chicago.",
    applicationHistory: [
      { date: new Date("2025-03-15"), status: "applied", note: "Application submitted" },
      { date: new Date("2025-03-18"), status: "viewed", note: "Application viewed by employer" }
    ],
    resume: {
      url: "#",
      name: "john_doe_resume.pdf"
    },
    coverLetter: {
      url: "#",
      name: "john_doe_cover_letter.pdf"
    }
  },
  {
    id: "app4",
    jobId: "4",
    jobTitle: "Sous Chef",
    restaurantName: "Pasta Palace",
    restaurantLogo: null,
    location: "Boston, MA",
    appliedDate: new Date("2025-03-10"),
    status: "rejected" as ApplicationStatus,
    notes: "Thank you for your interest, but we've selected another candidate",
    hasUnreadMessages: false,
    salary: "$55,000 - $65,000 per year",
    jobType: "Full-time",
    jobDescription: "Pasta Palace is looking for a skilled Sous Chef to assist our Head Chef in creating authentic Italian dishes.",
    applicationHistory: [
      { date: new Date("2025-03-10"), status: "applied", note: "Application submitted" },
      { date: new Date("2025-03-12"), status: "viewed", note: "Application viewed by employer" },
      { date: new Date("2025-03-15"), status: "in_review", note: "Application under review" },
      { date: new Date("2025-03-20"), status: "rejected", note: "Application rejected" }
    ],
    resume: {
      url: "#",
      name: "john_doe_resume.pdf"
    },
    coverLetter: {
      url: "#",
      name: "john_doe_cover_letter.pdf"
    }
  },
  {
    id: "app5",
    jobId: "5",
    jobTitle: "Event Staff",
    restaurantName: "Grand Ballroom",
    restaurantLogo: null,
    location: "Los Angeles, CA",
    appliedDate: new Date("2025-03-25"),
    status: "applied" as ApplicationStatus,
    notes: "",
    hasUnreadMessages: false,
    salary: "$20 per hour",
    jobType: "Part-time",
    jobDescription: "Grand Ballroom is hiring Event Staff to assist with setup, service, and cleanup for various events and functions.",
    applicationHistory: [
      { date: new Date("2025-03-25"), status: "applied", note: "Application submitted" }
    ],
    resume: {
      url: "#",
      name: "john_doe_resume.pdf"
    },
    coverLetter: null
  }
];

export default function ApplicationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if we have an ID and the user is authenticated
    if (id && !isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=' + encodeURIComponent(`/applications/${id}`));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // In a real app, this would be a Firebase query
        // For now, use mock data
        const foundApplication = mockApplications.find(app => app.id === id);
        
        if (foundApplication) {
          setApplication(foundApplication);
        } else {
          setError("Application not found");
        }
      } catch (err) {
        console.error("Error fetching application:", err);
        setError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    }
  }, [id, isAuthenticated, isLoading, router]);

  // Format date for display
  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
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
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Get status badge color and text
  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return { 
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", 
          text: "Applied",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case "viewed":
        return { 
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", 
          text: "Viewed",
          icon: <FileText className="h-4 w-4 mr-1" />
        };
      case "in_review":
        return { 
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", 
          text: "In Review",
          icon: <Clock3 className="h-4 w-4 mr-1" />
        };
      case "interview_scheduled":
        return { 
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
          text: "Interview Scheduled",
          icon: <CalendarClock className="h-4 w-4 mr-1" />
        };
      case "offered":
        return { 
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300", 
          text: "Job Offered",
          icon: <ThumbsUp className="h-4 w-4 mr-1" />
        };
      case "rejected":
        return { 
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", 
          text: "Not Selected",
          icon: <XCircle className="h-4 w-4 mr-1" />
        };
      case "withdrawn":
        return { 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", 
          text: "Withdrawn",
          icon: <XCircle className="h-4 w-4 mr-1" />
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800", 
          text: "Unknown",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
    }
  };

  // Handle withdrawing an application
  const handleWithdraw = () => {
    if (!application) return;
    
    // In a real app, this would update Firebase
    setApplication({
      ...application,
      status: "withdrawn" as ApplicationStatus,
      applicationHistory: [
        ...application.applicationHistory,
        {
          date: new Date(),
          status: "withdrawn",
          note: "Application withdrawn by candidate"
        }
      ]
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/applications')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  // Not found state
  if (!application) {
    return (
      <div className="container py-12 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
        <p className="text-muted-foreground mb-6">The application you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/applications')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(application.status);

  return (
    <>
      <Head>
        <title>{application.jobTitle} Application | StaffSpace</title>
        <meta name="description" content={`Details for your application to ${application.jobTitle} at ${application.restaurantName}`} />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => router.push('/applications')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{application.jobTitle}</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">{application.restaurantName}</p>
                <span className="text-muted-foreground">•</span>
                <p className="text-muted-foreground flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {application.location}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>
                  Applied on {formatDate(application.appliedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.applicationHistory.map((historyItem: any, index: number) => {
                    const itemStatus = getStatusInfo(historyItem.status);
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${itemStatus.color}`}>
                          {itemStatus.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{itemStatus.text}</h3>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(historyItem.date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {historyItem.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Job Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Type</h3>
                    <p>{application.jobType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Salary</h3>
                    <p>{application.salary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Description</h3>
                    <p>{application.jobDescription}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/jobs/${application.jobId}`}>
                  <Button variant="outline">
                    View Full Job Posting
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Application Materials Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Application Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <File className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{application.resume.name}</p>
                        <p className="text-sm text-muted-foreground">Resume</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  
                  {application.coverLetter && (
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <File className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{application.coverLetter.name}</p>
                          <p className="text-sm text-muted-foreground">Cover Letter</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/messaging?conversation=${application.restaurantName}`} className="w-full">
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Employer
                    {application.hasUnreadMessages && (
                      <span className="ml-2 h-2 w-2 bg-primary rounded-full" />
                    )}
                  </Button>
                </Link>
                
                {application.status === "interview_scheduled" && application.interviewDate && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CalendarClock className="mr-2 h-4 w-4 text-primary" />
                      Upcoming Interview
                    </h3>
                    <p className="text-sm mb-1">
                      {formatDate(application.interviewDate)} at {formatTime(application.interviewDate)}
                    </p>
                    <Button size="sm" className="mt-2" variant="outline">
                      Add to Calendar
                    </Button>
                  </div>
                )}
                
                {application.status !== "withdrawn" && application.status !== "rejected" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">No longer interested?</h3>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleWithdraw}
                      >
                        Withdraw Application
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Card */}
            <Card>
              <CardHeader>
                <CardTitle>About {application.restaurantName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{application.restaurantName}</h3>
                    <p className="text-sm text-muted-foreground">{application.location}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Hiring Manager</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>hiring@{application.restaurantName.toLowerCase().replace(/\s+/g, '')}.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>(555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}