import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  Bell, 
  FileText, 
  Settings, 
  Calendar, 
  MapPin, 
  DollarSign,
  Star,
  Plus,
  Download,
  Filter,
  Users,
  ChevronRight,
  MessageSquare,
  Building,
  Loader2,
  AlertCircle
} from "lucide-react";
import TutorialGuide from "@/components/common/TutorialGuide";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import UpcomingInterviews from "@/components/dashboard/UpcomingInterviews";
import BackButton from "@/components/common/BackButton";
import ErrorBoundary from "@/utils/errorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data for job listings
const mockListings = [
  {
    id: "1",
    title: "Head Chef",
    location: "New York, NY",
    jobType: "Full-time",
    salary: {
      amount: 75000,
      period: "Yearly"
    },
    postedDate: new Date("2025-03-20"),
    applicantsCount: 12,
    status: "Active",
    isPremium: true
  },
  {
    id: "2",
    title: "Bartender",
    location: "New York, NY",
    jobType: "Part-time",
    salary: {
      amount: 25,
      period: "Hourly"
    },
    postedDate: new Date("2025-03-22"),
    applicantsCount: 8,
    status: "Active",
    isPremium: false
  },
  {
    id: "3",
    title: "Server",
    location: "New York, NY",
    jobType: "Full-time",
    salary: {
      amount: 18,
      period: "Hourly"
    },
    postedDate: new Date("2025-03-15"),
    applicantsCount: 20,
    status: "Closed",
    isPremium: false
  }
];

// Mock data for applicants
const mockApplicants = [
  {
    id: "1",
    name: "John Doe",
    position: "Head Chef",
    experience: "8 years",
    appliedDate: new Date("2025-03-21"),
    status: "Reviewed",
    matchScore: 95,
    hasResume: true
  },
  {
    id: "2",
    name: "Sarah Johnson",
    position: "Sous Chef",
    experience: "5 years",
    appliedDate: new Date("2025-03-22"),
    status: "Pending",
    matchScore: 88,
    hasResume: true
  },
  {
    id: "3",
    name: "Michael Chen",
    position: "Line Cook",
    experience: "3 years",
    appliedDate: new Date("2025-03-23"),
    status: "Shortlisted",
    matchScore: 82,
    hasResume: true
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    position: "Pastry Chef",
    experience: "4 years",
    appliedDate: new Date("2025-03-24"),
    status: "Pending",
    matchScore: 78,
    hasResume: false
  }
];

// Tutorial steps
const tutorialSteps = [
  {
    title: "Welcome to Your Dashboard",
    description: "This is your restaurant dashboard where you can manage job listings and applicants.",
    targetElement: "#dashboard-overview"
  },
  {
    title: "Manage Your Job Listings",
    description: "View, edit, and create job listings for your restaurant.",
    targetElement: "#listings-tab"
  },
  {
    title: "Review Applicants",
    description: "Browse and filter applicants who have applied to your job listings.",
    targetElement: "#applicants-section"
  },
  {
    title: "Create New Listings",
    description: "Easily create new job listings to find the perfect staff for your restaurant.",
    targetElement: "#create-listing-button"
  }
];

export default function RestaurantDashboard() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Get the user's name safely
  const userName = userProfile?.firstName || "User";

  // Use router events for navigation state
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleStop = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;
    
    // Only redirect if we've finished loading and the user is not authenticated
    if (!isLoading && !isAuthenticated && mounted && !isNavigating) {
      router.push("/auth/login?redirect=/restaurant/dashboard")
        .catch(err => {
          console.error("Navigation error:", err);
        });
    }
    
    // Set local loading state based on auth loading
    if (!isLoading && mounted) {
      setLocalLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, router, isNavigating]);

  // Safe navigation function
  const safeNavigate = (path: string) => {
    if (isNavigating) return;
    router.push(path).catch(err => console.error("Navigation error:", err));
  };

  // Check tutorial status in useEffect
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      try {
        const hasSeenTutorial = localStorage.getItem("restaurant-tutorial-completed");
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        } else {
          setTutorialCompleted(true);
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleTutorialComplete = () => {
    try {
      localStorage.setItem("restaurant-tutorial-completed", "true");
      setTutorialCompleted(true);
      setShowTutorial(false);
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    try {
      // Ensure date is valid before formatting
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formatSalary = (salary: { amount: number, period: string }) => {
    try {
      if (!salary || typeof salary !== "object") {
        return "N/A";
      }
      
      if (salary.period === "Hourly") {
        return `$${salary.amount}/hr`;
      } else if (salary.period === "Yearly") {
        return `$${salary.amount.toLocaleString()}/year`;
      }
      
      return `$${salary.amount}/${salary.period.toLowerCase()}`;
    } catch (error) {
      console.error("Error formatting salary:", error);
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Show loading state
  if (isLoading || localLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view your dashboard.</p>
        <Button 
          onClick={() => {
            if (!isNavigating) {
              setIsNavigating(true);
              router.push("/auth/login?redirect=/restaurant/dashboard")
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

  // Add location property to mockApplicants for display
  const applicantsWithLocation = mockApplicants.map(applicant => ({
    ...applicant,
    location: "New York, NY" // Default location for all applicants
  }));

  return (
    <ErrorBoundary>
      <Head>
        <title>Restaurant Dashboard | StaffSpace</title>
        <meta name="description" content="Manage your restaurant profile, job listings, and applicants on StaffSpace." />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" id="dashboard-overview">Restaurant Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userName}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              onClick={() => safeNavigate("/restaurant/create-listing")}
              disabled={isNavigating}
            >
              <Plus className="mr-2 h-4 w-4" /> Post Job
            </Button>
            <Button 
              variant="outline" 
              onClick={() => safeNavigate("/profile/edit")}
              disabled={isNavigating}
            >
              <Settings className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings" id="listings-tab">Job Listings</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockListings.filter(l => l.status === "Active").length}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockListings.filter(l => l.status === "Active").length} listings active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Applicants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applicantsWithLocation.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {applicantsWithLocation.filter(a => a.status === "Pending").length} new applicants this week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    5 upcoming interviews
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">56</div>
                  <p className="text-xs text-muted-foreground">
                    8 unread messages
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applicants</CardTitle>
                  <CardDescription>
                    Latest candidates who applied to your job listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" id="applicants-section">
                    {applicantsWithLocation.map((applicant) => (
                      <div key={applicant.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-medium">{applicant.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">Applied for: {applicant.position}</p>
                            <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="mr-1.5 h-4 w-4" />
                                {applicant.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1.5 h-4 w-4" />
                                Applied {formatDate(applicant.appliedDate)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end md:self-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => safeNavigate(`/messaging?conversation=${applicant.name}`)}
                              disabled={isNavigating}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" /> Message
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => safeNavigate(`/restaurant/applicants/profile/${applicant.id}`)}
                              disabled={isNavigating}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => safeNavigate("/restaurant/applicants/1")}
                    disabled={isNavigating}
                  >
                    View All Applicants
                  </Button>
                </div>
              </Card>

              <UpcomingInterviews userType="restaurant" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Job Listings</CardTitle>
                <CardDescription>
                  Manage your active job postings
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {/* Content showing some listings would go here */}
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex gap-4">
                  <Button 
                    className="w-full" 
                    id="create-listing-button"
                    onClick={() => safeNavigate("/restaurant/create-listing")}
                    disabled={isNavigating}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Post New Job
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => safeNavigate("/restaurant/listings")}
                    disabled={isNavigating}
                  >
                    View All Listings
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Job Listings Tab */}
          <TabsContent value="listings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Job Listings</CardTitle>
                  <CardDescription>
                    Manage your active job postings
                  </CardDescription>
                </div>
                <Button 
                  size="sm"
                  onClick={() => safeNavigate("/restaurant/create-listing")}
                  disabled={isNavigating}
                >
                  <Plus className="mr-2 h-4 w-4" /> Post New Job
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockListings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{listing.title}</h3>
                          <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <Building className="mr-1.5 h-4 w-4" />
                              {listing.jobType}
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-1.5 h-4 w-4" />
                              {listing.applicantsCount} applicants
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-4 w-4" />
                              Posted {formatDate(listing.postedDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end md:self-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => safeNavigate(`/jobs/${listing.id}/edit`)}
                            disabled={isNavigating}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => safeNavigate(`/restaurant/applicants/${listing.id}`)}
                            disabled={isNavigating}
                          >
                            View Applicants
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants">
            <Card>
              <CardHeader>
                <CardTitle>All Applicants</CardTitle>
                <CardDescription>
                  Review and manage candidates for your job listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicantsWithLocation.map((applicant) => (
                    <div key={applicant.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{applicant.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">Applied for: {applicant.position}</p>
                          <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="mr-1.5 h-4 w-4" />
                              {applicant.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-4 w-4" />
                              Applied {formatDate(applicant.appliedDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end md:self-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => safeNavigate(`/messaging?conversation=${applicant.name}`)}
                            disabled={isNavigating}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" /> Message
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => safeNavigate(`/restaurant/applicants/profile/${applicant.id}`)}
                            disabled={isNavigating}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <UpcomingInterviews userType="restaurant" />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard userType="restaurant" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Tutorial Guide */}
      <TutorialGuide
        steps={tutorialSteps}
        onComplete={handleTutorialComplete}
        isOpen={showTutorial}
        onOpenChange={setShowTutorial}
      />
    </ErrorBoundary>
  );
}
