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
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import BackButton from "@/components/common/BackButton";
import ErrorBoundary from "@/utils/errorBoundary";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Mock data for interviews
const mockInterviews = [
  {
    id: "int1",
    jobTitle: "Head Chef",
    restaurantName: "La Bistro Restaurant",
    location: "New York, NY",
    date: new Date("2025-04-05T14:00:00"),
    type: "in-person",
    notes: "Bring your portfolio and be prepared to discuss your experience with French cuisine.",
    status: "upcoming"
  },
  {
    id: "int2",
    jobTitle: "Bartender",
    restaurantName: "The Speakeasy",
    location: "Chicago, IL",
    date: new Date("2025-04-07T16:30:00"),
    type: "video",
    notes: "Prepare to demonstrate your mixology skills and knowledge of classic cocktails.",
    status: "upcoming"
  },
  {
    id: "int3",
    jobTitle: "Server",
    restaurantName: "Oceanview Grill",
    location: "Miami, FL",
    date: new Date("2025-04-10T11:00:00"),
    type: "phone",
    notes: "Initial phone screening to discuss your experience and availability.",
    status: "upcoming"
  },
  {
    id: "int4",
    jobTitle: "Sous Chef",
    restaurantName: "La Bistro Restaurant",
    location: "New York, NY",
    date: new Date("2025-03-28T10:00:00"),
    type: "in-person",
    notes: "Completed initial interview. Follow-up interview scheduled for next week.",
    status: "completed"
  },
  {
    id: "int5",
    jobTitle: "Host/Hostess",
    restaurantName: "The Grand Hotel",
    location: "Boston, MA",
    date: new Date("2025-03-25T15:30:00"),
    type: "video",
    notes: "Interview went well. Waiting to hear back from the restaurant.",
    status: "completed"
  }
];

export default function ApplicantInterviews() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInterviews, setFilteredInterviews] = useState(mockInterviews);

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;
    
    // Only redirect if we've finished loading and the user is not authenticated
    if (!isLoading && !isAuthenticated && mounted && !isNavigating) {
      setIsNavigating(true);
      router.push("/auth/login?redirect=/applicant/interviews")
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
  }, [isAuthenticated, isLoading, router, isNavigating]);

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

  // Apply filters
  useEffect(() => {
    let result = [...mockInterviews];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(interview => 
        interview.jobTitle.toLowerCase().includes(term) ||
        interview.restaurantName.toLowerCase().includes(term) ||
        interview.location.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(interview => interview.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(interview => interview.type === typeFilter);
    }
    
    // Sort by date (most recent first)
    const sorted = [...result].sort((a, b) => {
      const timeA = a.scheduledTime?.toMillis() || 0;
      const timeB = b.scheduledTime?.toMillis() || 0;
      return timeB - timeA;
    });

    setFilteredInterviews(sorted);
  }, [statusFilter, typeFilter, searchTerm]);

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

  // Show loading state
  if (isLoading || localLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading interviews...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view your interviews.</p>
        <Button 
          onClick={() => {
            if (!isNavigating) {
              setIsNavigating(true);
              router.push("/auth/login?redirect=/applicant/interviews")
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
        <title>My Interviews | StaffSpace</title>
        <meta name="description" content="Manage your scheduled interviews with restaurants on StaffSpace." />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton href="/applicant/dashboard" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Interviews</h1>
              <p className="text-muted-foreground">
                Manage your scheduled interviews with restaurants
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search interviews..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select 
                value={typeFilter} 
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredInterviews.length} of {mockInterviews.length} interviews
          </div>
        </div>

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No interviews found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "No interviews match your search criteria. Try adjusting your filters."
                  : "You don't have any scheduled interviews yet. Apply to jobs to get started!"}
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                disabled={!searchTerm && statusFilter === "all" && typeFilter === "all"}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <Card key={interview.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <h3 className="text-xl font-medium">{interview.jobTitle}</h3>
                        {getInterviewTypeBadge(interview.type)}
                        {getInterviewStatusBadge(interview.status)}
                      </div>
                      <p className="text-sm font-medium mb-2">{interview.restaurantName}</p>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-4 w-4" />
                          {interview.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1.5 h-4 w-4" />
                          {formatDate(interview.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-4 w-4" />
                          {formatTime(interview.date)}
                        </div>
                      </div>
                      {interview.notes && (
                        <div className="mt-2 text-sm bg-muted p-2 rounded">
                          <p>{interview.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 self-end md:self-start">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => safeNavigate(`/messaging?conversation=${interview.restaurantName}`)}
                          disabled={isNavigating}
                          className="w-full"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" /> Message
                        </Button>
                        {interview.status === "upcoming" && interview.type !== "in-person" && (
                          <Button 
                            size="sm"
                            className="w-full"
                          >
                            {getInterviewTypeIcon(interview.type)}
                            <span className="ml-1">
                              {interview.type === "video" ? "Join Call" : "Call"}
                            </span>
                          </Button>
                        )}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => safeNavigate(`/applicant/interviews/${interview.id}`)}
                        disabled={isNavigating}
                        className="w-full"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}