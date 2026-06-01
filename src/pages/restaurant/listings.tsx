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
  Settings, 
  MapPin, 
  DollarSign,
  Plus,
  Filter,
  Users,
  Building,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Edit,
  Eye,
  Trash2
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import BackButton from "@/components/common/BackButton";
import ErrorBoundary from "@/utils/errorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  },
  {
    id: "4",
    title: "Dishwasher",
    location: "New York, NY",
    jobType: "Part-time",
    salary: {
      amount: 16,
      period: "Hourly"
    },
    postedDate: new Date("2025-03-18"),
    applicantsCount: 5,
    status: "Active",
    isPremium: false
  },
  {
    id: "5",
    title: "Host/Hostess",
    location: "New York, NY",
    jobType: "Part-time",
    salary: {
      amount: 17,
      period: "Hourly"
    },
    postedDate: new Date("2025-03-19"),
    applicantsCount: 15,
    status: "Active",
    isPremium: false
  }
];

export default function RestaurantListings() {
  const { user, userProfile, isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filteredListings, setFilteredListings] = useState(mockListings);

  // Check if user is authenticated
  useEffect(() => {
    let mounted = true;
    
    // Only redirect if we've finished loading and the user is not authenticated
    if (!isLoading && !isAuthenticated && mounted && !isNavigating) {
      setIsNavigating(true);
      router.push("/auth/login?redirect=/restaurant/listings")
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
    let result = [...mockListings];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(listing => listing.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      result = [...result].sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeA - timeB;
      });
    } else if (sortBy === "applicants") {
      result = [...result].sort((a, b) => b.applicantsCount - a.applicantsCount);
    }
    
    setFilteredListings(result);
  }, [statusFilter, sortBy]);

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
          <p className="text-muted-foreground">Loading your listings...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-6">You need to be signed in to view your listings.</p>
        <Button 
          onClick={() => {
            if (!isNavigating) {
              setIsNavigating(true);
              router.push("/auth/login?redirect=/restaurant/listings")
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
        <title>Your Job Listings | StaffSpace</title>
        <meta name="description" content="Manage your restaurant job listings on StaffSpace." />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <BackButton href="/restaurant/dashboard" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Job Listings</h1>
              <p className="text-muted-foreground">
                Manage and monitor all your restaurant job postings
              </p>
            </div>
          </div>
          <Button 
            onClick={() => safeNavigate("/restaurant/create-listing")}
            disabled={isNavigating}
          >
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="applicants">Most Applicants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredListings.length} of {mockListings.length} listings
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {statusFilter !== "all" 
                  ? `You don't have any ${statusFilter} job listings. Try changing your filters or create a new listing.`
                  : "You don't have any job listings yet. Create your first job posting to start finding staff."}
              </p>
              <Button 
                onClick={() => safeNavigate("/restaurant/create-listing")}
                disabled={isNavigating}
              >
                <Plus className="mr-2 h-4 w-4" /> Post New Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className={listing.isPremium ? "border-primary/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-medium">{listing.title}</h3>
                        {listing.isPremium && (
                          <Badge variant="default" className="bg-primary text-primary-foreground">
                            Premium
                          </Badge>
                        )}
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-4 w-4" />
                          {listing.location}
                        </div>
                        <div className="flex items-center">
                          <Building className="mr-1.5 h-4 w-4" />
                          {listing.jobType}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-1.5 h-4 w-4" />
                          {formatSalary(listing.salary)}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 text-sm">
                        <div className="flex items-center">
                          <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                          <span>
                            <span className="font-medium">{listing.applicantsCount}</span> applicants
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-4 w-4 text-muted-foreground" />
                          <span>Posted {formatDate(listing.postedDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage Listing</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => safeNavigate(`/jobs/${listing.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Listing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => safeNavigate(`/jobs/${listing.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Listing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => safeNavigate(`/jobs/${listing.id}/applicants`)}>
                            <Users className="mr-2 h-4 w-4" />
                            View Applicants
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Listing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button 
                        size="sm"
                        onClick={() => safeNavigate(`/restaurant/applicants/${listing.id}`)}
                        disabled={isNavigating}
                      >
                        View Applicants
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