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
  Briefcase, 
  Clock, 
  MapPin, 
  Download,
  MessageSquare,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  Filter,
  ChevronDown,
  Search
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for job listing
const mockJob = {
  id: "1",
  title: "Head Chef",
  location: "New York, NY",
  jobType: "Full-time",
  salary: {
    amount: 75000,
    period: "Yearly"
  },
  description: "Experienced head chef needed for upscale French restaurant. Minimum 5 years experience required.",
  postedDate: new Date("2025-03-20"),
  applicantsCount: 12,
  status: "Active",
  isPremium: true,
  restaurantName: "La Bistro"
};

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
    hasResume: true,
    location: "New York, NY",
    coverLetter: "I am excited to apply for the Head Chef position at La Bistro. With 8 years of experience in French cuisine...",
    skills: ["French Cuisine", "Menu Development", "Team Management", "Food Presentation"]
  },
  {
    id: "2",
    name: "Sarah Johnson",
    position: "Head Chef",
    experience: "5 years",
    appliedDate: new Date("2025-03-22"),
    status: "Pending",
    matchScore: 88,
    hasResume: true,
    location: "Brooklyn, NY",
    coverLetter: "Having worked in several high-end restaurants, I believe I would be a great fit for the Head Chef position...",
    skills: ["French Cuisine", "Inventory Management", "Staff Training", "Wine Pairing"]
  },
  {
    id: "3",
    name: "Michael Chen",
    position: "Head Chef",
    experience: "10 years",
    appliedDate: new Date("2025-03-23"),
    status: "Shortlisted",
    matchScore: 92,
    hasResume: true,
    location: "Jersey City, NJ",
    coverLetter: "As a chef with 10 years of experience in French and Asian fusion cuisine, I am excited about the opportunity...",
    skills: ["French Cuisine", "Asian Fusion", "Menu Innovation", "Cost Control"]
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    position: "Head Chef",
    experience: "7 years",
    appliedDate: new Date("2025-03-24"),
    status: "Pending",
    matchScore: 85,
    hasResume: false,
    location: "Queens, NY",
    coverLetter: "I am writing to express my interest in the Head Chef position at La Bistro. My background in...",
    skills: ["Mediterranean Cuisine", "French Techniques", "Kitchen Management", "Seasonal Menus"]
  }
];

export default function JobApplicantsPage() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const { jobId } = router.query;
  const [localLoading, setLocalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApplicants, setFilteredApplicants] = useState(mockApplicants);
  const [job, setJob] = useState(mockJob);

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;
    
    // Only redirect if we've finished loading and the user is not authenticated
    if (!isLoading && !isAuthenticated && mounted && !isNavigating) {
      setIsNavigating(true);
      router.push(`/auth/login?redirect=/restaurant/applicants/${jobId}`)
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
  }, [isAuthenticated, isLoading, router, isNavigating, jobId]);

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

  // Apply filters and sorting
  useEffect(() => {
    let result = [...mockApplicants];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(applicant => 
        applicant.name.toLowerCase().includes(term) ||
        applicant.skills.some(skill => skill.toLowerCase().includes(term)) ||
        applicant.location.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(applicant => applicant.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply sorting
    if (sortBy === "match") {
      result.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "recent") {
      result.sort((a, b) => {
        const dateA = a.appliedDate instanceof Date ? a.appliedDate.getTime() : 0;
        const dateB = b.appliedDate instanceof Date ? b.appliedDate.getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "experience") {
      result.sort((a, b) => {
        const expA = parseInt(a.experience.split(" ")[0]) || 0;
        const expB = parseInt(b.experience.split(" ")[0]) || 0;
        return expB - expA;
      });
    }
    
    setFilteredApplicants(result);
  }, [statusFilter, sortBy, searchTerm]);

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
          <p className="text-muted-foreground">Loading applicants...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view applicants.</p>
        <Button 
          onClick={() => {
            if (!isNavigating) {
              setIsNavigating(true);
              router.push(`/auth/login?redirect=/restaurant/applicants/${jobId}`)
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
        <title>Applicants for {job.title} | StaffSpace</title>
        <meta name="description" content={`Review applicants for the ${job.title} position at your restaurant.`} />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton href="/restaurant/listings" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
              <p className="text-muted-foreground">
                Reviewing candidates for {job.title}
              </p>
            </div>
          </div>
        </div>

        {/* Job Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-medium">{job.title}</h2>
                  <Badge className={job.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {job.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{job.restaurantName} • {job.location}</p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center">
                    <Briefcase className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <span>{job.jobType}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <span>Posted {formatDate(job.postedDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                    <span>{job.applicantsCount} applicants</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 self-end md:self-center">
                <Button 
                  variant="outline"
                  onClick={() => safeNavigate(`/jobs/${job.id}`)}
                  disabled={isNavigating}
                >
                  View Job Listing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search applicants..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredApplicants.length} of {mockApplicants.length} applicants
          </div>
        </div>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No applicants found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm 
                  ? `No applicants match your search criteria. Try adjusting your filters.`
                  : statusFilter !== "all"
                    ? `You don't have any ${statusFilter} applicants. Try changing your filters.`
                    : "You don't have any applicants for this job listing yet."}
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                disabled={!searchTerm && statusFilter === "all"}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((applicant) => (
              <Card key={applicant.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <h3 className="text-xl font-medium">{applicant.name}</h3>
                        <Badge className={getStatusColor(applicant.status)}>
                          {applicant.status}
                        </Badge>
                        <div className={`text-sm font-medium ${getMatchScoreColor(applicant.matchScore)}`}>
                          {applicant.matchScore}% Match
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-4 w-4" />
                          {applicant.location}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="mr-1.5 h-4 w-4" />
                          {applicant.experience} experience
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-4 w-4" />
                          Applied {formatDate(applicant.appliedDate)}
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm line-clamp-2">{applicant.coverLetter}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 self-end md:self-start">
                      <div className="flex gap-2">
                        {applicant.hasResume && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                          >
                            <Download className="mr-2 h-4 w-4" /> Resume
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => safeNavigate(`/messaging?conversation=${applicant.name}`)}
                          disabled={isNavigating}
                          className="w-full"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" /> Message
                        </Button>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => safeNavigate(`/restaurant/applicants/profile/${applicant.id}`)}
                        disabled={isNavigating}
                        className="w-full"
                      >
                        View Profile
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            Update Status <ChevronDown className="ml-2 h-4 w-4" />
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

// Ensure the main component is exported as default
export default JobApplicantsPage;
// If your component has a different name, replace JobApplicantsPage with the correct name.
// For example, if it's: function ViewApplicants() { ... }
// Then it should be: export default ViewApplicants;