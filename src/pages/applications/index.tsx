import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Building,
  MessageSquare,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarClock,
  ThumbsUp,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Application status types
type ApplicationStatus = 
  | "applied" 
  | "viewed" 
  | "in_review" 
  | "interview_scheduled" 
  | "offered" 
  | "rejected" 
  | "withdrawn";

// Mock application data
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
  }
];

export default function ApplicationsPage() {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState(mockApplications);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view your applications.</p>
        <Button onClick={() => router.push("/auth/login?redirect=/applications")}>
          Sign In
        </Button>
      </div>
    );
  }

  // Filter applications based on selected status
  const filteredApplications = selectedStatus 
    ? applications.filter(app => app.status === selectedStatus)
    : applications;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
  const handleWithdraw = (applicationId: string) => {
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status: "withdrawn" as ApplicationStatus } : app
    );
    setApplications(updatedApplications);
  };

  return (
    <>
      <Head>
        <title>My Applications | StaffSpace</title>
        <meta name="description" content="Track and manage your job applications on StaffSpace." />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Applications</h1>
            <p className="text-muted-foreground">Track and manage your job applications</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Applications</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="offered">Job Offered</SelectItem>
                <SelectItem value="rejected">Not Selected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/jobs">
              <Button variant="outline">Find More Jobs</Button>
            </Link>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-medium mb-2">No Applications Yet</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                You haven't applied to any jobs yet. Browse available positions and submit your first application.
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hidden md:block">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => {
                        const statusInfo = getStatusInfo(application.status);
                        return (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">
                              <Link href={`/jobs/${application.jobId}`} className="hover:text-primary transition-colors">
                                {application.jobTitle}
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {application.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Building className="h-4 w-4 text-primary" />
                                </div>
                                <span>{application.restaurantName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(application.appliedDate)}
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {statusInfo.text}
                              </div>
                              {application.status === "interview_scheduled" && application.interviewDate && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {formatDate(application.interviewDate)} at {formatTime(application.interviewDate)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Link href={`/messaging?conversation=${application.restaurantName}`}>
                                  <Button variant="outline" size="sm" className="h-8 relative">
                                    <MessageSquare className="h-4 w-4" />
                                    {application.hasUnreadMessages && (
                                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                                    )}
                                  </Button>
                                </Link>
                                <Link href={`/applications/${application.id}`}>
                                  <Button variant="outline" size="sm" className="h-8">
                                    Details
                                  </Button>
                                </Link>
                                {application.status !== "withdrawn" && application.status !== "rejected" && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-destructive hover:text-destructive"
                                    onClick={() => handleWithdraw(application.id)}
                                  >
                                    Withdraw
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Mobile view */}
            <div className="md:hidden space-y-4">
              {filteredApplications.map((application) => {
                const statusInfo = getStatusInfo(application.status);
                return (
                  <Card key={application.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{application.jobTitle}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Building className="h-3 w-3 mr-1" />
                            {application.restaurantName}
                          </CardDescription>
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {application.location}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied: {formatDate(application.appliedDate)}
                      </div>
                      {application.status === "interview_scheduled" && application.interviewDate && (
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <CalendarClock className="h-4 w-4 mr-1" />
                          Interview: {formatDate(application.interviewDate)} at {formatTime(application.interviewDate)}
                        </div>
                      )}
                      {application.notes && (
                        <div className="mt-2 text-sm">
                          <p>{application.notes}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex gap-2">
                        <Link href={`/messaging?conversation=${application.restaurantName}`}>
                          <Button variant="outline" size="sm" className="h-8 relative">
                            <MessageSquare className="h-4 w-4" />
                            {application.hasUnreadMessages && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                            )}
                          </Button>
                        </Link>
                        {application.status !== "withdrawn" && application.status !== "rejected" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-destructive hover:text-destructive"
                            onClick={() => handleWithdraw(application.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                      <Link href={`/applications/${application.id}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}