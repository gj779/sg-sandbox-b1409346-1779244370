import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Building, MessageSquare, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Application status types
type ApplicationStatus = 
  | "applied" 
  | "viewed" 
  | "in_review" 
  | "interview_scheduled" 
  | "offered" 
  | "rejected" 
  | "withdrawn";

// Application type
interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  restaurantName: string;
  location: string;
  appliedDate: Date | null;
  status: ApplicationStatus;
  hasUnreadMessages: boolean;
}

// Mock data for recent applications as fallback
const mockApplications = [
  {
    id: "app1",
    jobId: "job-1",
    jobTitle: "Head Chef",
    restaurantName: "La Bistro Restaurant",
    location: "New York, NY",
    appliedDate: new Date("2025-03-20"),
    status: "interview_scheduled" as ApplicationStatus,
    hasUnreadMessages: true,
  },
  {
    id: "app2",
    jobId: "job-2",
    jobTitle: "Server",
    restaurantName: "Coastal Kitchen",
    location: "Miami, FL",
    appliedDate: new Date("2025-03-22"),
    status: "in_review" as ApplicationStatus,
    hasUnreadMessages: false,
  },
  {
    id: "app3",
    jobId: "job-3",
    jobTitle: "Bartender",
    restaurantName: "The Speakeasy",
    location: "Chicago, IL",
    appliedDate: new Date("2025-03-15"),
    status: "viewed" as ApplicationStatus,
    hasUnreadMessages: false,
  }
];

export default function RecentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useUser();

  // Fetch applications from Firestore
  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAuthenticated || !user?.uid) {
        // Use mock data if not authenticated
        setApplications(mockApplications);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const applicationsRef = collection(db, "applications");
        const q = query(
          applicationsRef,
          where("applicantId", "==", user.uid),
          orderBy("appliedDate", "desc"),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setApplications([]);
          setIsLoading(false);
          return;
        }

        const fetchedApplications: Application[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedApplications.push({
            id: doc.id,
            jobId: data.jobId || "",
            jobTitle: data.jobTitle || "Unknown Position",
            restaurantName: data.restaurantName || "Unknown Restaurant",
            location: data.location || "Location not specified",
            appliedDate: data.appliedDate ? new Date(data.appliedDate.toDate()) : null,
            status: (data.status as ApplicationStatus) || "applied",
            hasUnreadMessages: data.hasUnreadMessages || false,
          });
        });

        setApplications(fetchedApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
        // Fallback to mock data on error
        setApplications(mockApplications);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, isAuthenticated]);

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Date not available";
    
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

  // Get status badge color and text
  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return { 
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300", 
          text: "Applied",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case "viewed":
        return { 
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-300", 
          text: "Viewed",
          icon: <FileText className="h-4 w-4 mr-1" />
        };
      case "in_review":
        return { 
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300", 
          text: "In Review",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
      case "interview_scheduled":
        return { 
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300", 
          text: "Interview Scheduled",
          icon: <Calendar className="h-4 w-4 mr-1" />
        };
      case "offered":
        return { 
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-300", 
          text: "Job Offered",
          icon: <FileText className="h-4 w-4 mr-1" />
        };
      case "rejected":
        return { 
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300", 
          text: "Not Selected",
          icon: <FileText className="h-4 w-4 mr-1" />
        };
      case "withdrawn":
        return { 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300", 
          text: "Withdrawn",
          icon: <FileText className="h-4 w-4 mr-1" />
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-300", 
          text: "Unknown",
          icon: <Clock className="h-4 w-4 mr-1" />
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Your most recent job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-medium mb-2">Loading Applications...</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>
          Your most recent job applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground text-sm">
              You haven't applied to any jobs yet. Browse available positions and submit your first application.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusInfo = getStatusInfo(application.status);
              return (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{application.jobTitle}</h3>
                        <Badge variant="outline" className={statusInfo.color}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{application.restaurantName}</p>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-4 w-4" />
                          {application.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1.5 h-4 w-4" />
                          Applied: {formatDate(application.appliedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <Link href={`/messaging?conversation=${application.restaurantName}`}>
                        <Button variant="outline" size="sm" className="relative">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                          {application.hasUnreadMessages && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                          )}
                        </Button>
                      </Link>
                      <Link href={`/applications/${application.id}`}>
                        <Button size="sm">
                          Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/applications" className="w-full">
          <Button variant="outline" className="w-full">
            View All Applications
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}