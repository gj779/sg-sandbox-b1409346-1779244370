
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
  ChevronRight
} from "lucide-react";
import TutorialGuide from "@/components/common/TutorialGuide";

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
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to show tutorial
    const hasSeenTutorial = localStorage.getItem("restaurant-tutorial-completed");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    } else {
      setTutorialCompleted(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem("restaurant-tutorial-completed", "true");
    setTutorialCompleted(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatSalary = (salary: { amount: number, period: string }) => {
    if (salary.period === "Hourly") {
      return `$${salary.amount}/hr`;
    } else if (salary.period === "Yearly") {
      return `$${salary.amount.toLocaleString()}/year`;
    }
    return `$${salary.amount}/${salary.period.toLowerCase()}`;
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

  return (
    <>
      <Head>
        <title>Restaurant Dashboard | StaffSpace</title>
        <meta name="description" content="Manage your restaurant job listings and applicants." />
      </Head>

      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Restaurant Dashboard</h1>
            <p className="text-muted-foreground">Manage your job listings and find the perfect staff</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
              <Bell className="mr-2 h-4 w-4" />
              Tutorial
            </Button>
            <Link href="/restaurant/settings">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card id="dashboard-overview" className="mb-6">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Your restaurant hiring at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{mockListings.filter(l => l.status === "Active").length}</div>
                    <div className="text-sm text-muted-foreground">Active Listings</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{mockApplicants.length}</div>
                    <div className="text-sm text-muted-foreground">Total Applicants</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{mockApplicants.filter(a => a.status === "Shortlisted").length}</div>
                    <div className="text-sm text-muted-foreground">Shortlisted</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{mockApplicants.filter(a => a.status === "Pending").length}</div>
                    <div className="text-sm text-muted-foreground">Pending Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="listings" className="mb-6">
              <TabsList>
                <TabsTrigger id="listings-tab" value="listings">Job Listings</TabsTrigger>
                <TabsTrigger value="applicants">Applicants</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="listings">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Your Job Listings</CardTitle>
                      <CardDescription>Manage and create job listings</CardDescription>
                    </div>
                    <Link href="/restaurant/create-listing">
                      <Button id="create-listing-button">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Listing
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {mockListings.length > 0 ? (
                      <div className="space-y-4">
                        {mockListings.map((listing) => (
                          <div key={listing.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{listing.title}</h3>
                                  {listing.isPremium && (
                                    <Badge variant="default" className="bg-primary">Featured</Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                                  <div className="flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    <span>{listing.location}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Briefcase className="mr-1 h-3 w-3" />
                                    <span>{listing.jobType}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    <span>{formatSalary(listing.salary)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    <span>Posted {formatDate(listing.postedDate)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-start md:items-end gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(listing.status)}`}>
                                  {listing.status}
                                </span>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Users className="mr-1 h-3 w-3" />
                                  <span>{listing.applicantsCount} applicants</span>
                                </div>
                                <div className="flex gap-2">
                                  <Link href={`/restaurant/listings/${listing.id}`}>
                                    <Button variant="outline" size="sm">Edit</Button>
                                  </Link>
                                  <Link href={`/restaurant/listings/${listing.id}/applicants`}>
                                    <Button size="sm">View Applicants</Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">No job listings yet</h3>
                        <p className="mt-2 text-muted-foreground">
                          Create your first job listing to start finding staff.
                        </p>
                        <Link href="/restaurant/create-listing">
                          <Button className="mt-4">
                            Create Job Listing
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="applicants">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Recent Applicants</CardTitle>
                      <CardDescription>Review and manage applicants</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </CardHeader>
                  <CardContent id="applicants-section">
                    {mockApplicants.length > 0 ? (
                      <div className="space-y-4">
                        {mockApplicants.map((applicant) => (
                          <div key={applicant.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">
                                    {applicant.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium">{applicant.name}</h3>
                                  <p className="text-sm text-muted-foreground">{applicant.position}</p>
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Briefcase className="mr-1 h-3 w-3" />
                                    <span>{applicant.experience} experience</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-start md:items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(applicant.status)}`}>
                                    {applicant.status}
                                  </span>
                                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                                    {applicant.matchScore}% Match
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Applied on {formatDate(applicant.appliedDate)}
                                </span>
                                <div className="flex gap-2">
                                  {applicant.hasResume && (
                                    <Button variant="outline" size="sm">
                                      <Download className="mr-1 h-3 w-3" />
                                      Resume
                                    </Button>
                                  )}
                                  <Link href={`/restaurant/applicants/${applicant.id}`}>
                                    <Button size="sm">View Profile</Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">No applicants yet</h3>
                        <p className="mt-2 text-muted-foreground">
                          When people apply to your job listings, they'll appear here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Link href="/restaurant/applicants">View All Applicants</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Interviews</CardTitle>
                    <CardDescription>Manage your scheduled interviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No upcoming interviews</h3>
                      <p className="mt-2 text-muted-foreground">
                        Schedule interviews with applicants to see them here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Restaurant Profile</CardTitle>
                <CardDescription>Manage your restaurant information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">LB</span>
                  </div>
                  <h3 className="text-lg font-medium">La Bistro</h3>
                  <p className="text-sm text-muted-foreground">French Restaurant</p>
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profile Completion</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full">
                  <Link href="/restaurant/profile">Edit Profile</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Link href="/restaurant/settings">Settings</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for restaurant managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/restaurant/create-listing">
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create Job Listing</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/restaurant/applicants">
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Browse Applicants</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/restaurant/schedule">
                    <Button variant="outline" className="w-full justify-between">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Schedule Interviews</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>Upgrade to get more visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Featured Listings</h4>
                      <p className="text-xs text-muted-foreground">Get more visibility for your job listings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Advanced Filtering</h4>
                      <p className="text-xs text-muted-foreground">Filter applicants by skills and availability</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Unlimited Listings</h4>
                      <p className="text-xs text-muted-foreground">Post as many job listings as you need</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <TutorialGuide
        steps={tutorialSteps}
        onComplete={handleTutorialComplete}
        isOpen={showTutorial}
        onOpenChange={setShowTutorial}
      />
    </>
  );
}
