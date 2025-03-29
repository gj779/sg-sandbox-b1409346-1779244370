
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
  ChevronRight
} from "lucide-react";
import TutorialGuide from "@/components/common/TutorialGuide";

// Mock data for applications
const mockApplications = [
  {
    id: "1",
    jobTitle: "Head Chef",
    restaurantName: "La Bistro",
    location: "New York, NY",
    appliedDate: new Date("2025-03-20"),
    status: "Pending"
  },
  {
    id: "2",
    jobTitle: "Bartender",
    restaurantName: "The Speakeasy",
    location: "Chicago, IL",
    appliedDate: new Date("2025-03-22"),
    status: "Reviewed"
  },
  {
    id: "3",
    jobTitle: "Server",
    restaurantName: "Oceanview Grill",
    location: "Miami, FL",
    appliedDate: new Date("2025-03-25"),
    status: "Shortlisted"
  }
];

// Mock data for recommended jobs
const mockRecommendedJobs = [
  {
    id: "1",
    title: "Sous Chef",
    restaurantName: "Gourmet Kitchen",
    location: "San Francisco, CA",
    jobType: "Full-time",
    salary: {
      amount: 65000,
      period: "Yearly"
    },
    postedDate: new Date("2025-03-26"),
    matchScore: 95
  },
  {
    id: "2",
    title: "Line Cook",
    restaurantName: "Urban Plate",
    location: "Los Angeles, CA",
    jobType: "Full-time",
    salary: {
      amount: 22,
      period: "Hourly"
    },
    postedDate: new Date("2025-03-25"),
    matchScore: 88
  },
  {
    id: "3",
    title: "Pastry Chef",
    restaurantName: "Sweet Delights",
    location: "Portland, OR",
    jobType: "Part-time",
    salary: {
      amount: 28,
      period: "Hourly"
    },
    postedDate: new Date("2025-03-24"),
    matchScore: 82
  }
];

// Tutorial steps
const tutorialSteps = [
  {
    title: "Welcome to Your Dashboard",
    description: "This is your personal dashboard where you can manage your job applications and discover new opportunities.",
    targetElement: "#dashboard-overview"
  },
  {
    title: "Track Your Applications",
    description: "View and manage all your job applications in one place.",
    targetElement: "#applications-tab"
  },
  {
    title: "Discover New Opportunities",
    description: "Browse recommended jobs that match your skills and preferences.",
    targetElement: "#recommended-jobs"
  },
  {
    title: "Update Your Profile",
    description: "Keep your profile and resume up to date to improve your chances of getting hired.",
    targetElement: "#profile-card"
  }
];

export default function ApplicantDashboard() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    // Check if this is the first visit to show tutorial
    const hasSeenTutorial = localStorage.getItem("applicant-tutorial-completed");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    } else {
      setTutorialCompleted(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem("applicant-tutorial-completed", "true");
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
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Shortlisted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Hired":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard | StaffSpace</title>
        <meta name="description" content="Manage your job applications and discover new opportunities." />
      </Head>

      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Applicant Dashboard</h1>
            <p className="text-muted-foreground">Manage your job applications and discover new opportunities</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
              <Bell className="mr-2 h-4 w-4" />
              Tutorial
            </Button>
            <Link href="/applicant/settings">
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
                <CardDescription>Your job search at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{mockApplications.length}</div>
                    <div className="text-sm text-muted-foreground">Applications</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">2</div>
                    <div className="text-sm text-muted-foreground">Interviews</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">8</div>
                    <div className="text-sm text-muted-foreground">Saved Jobs</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary">12</div>
                    <div className="text-sm text-muted-foreground">New Matches</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="applications" className="mb-6">
              <TabsList>
                <TabsTrigger id="applications-tab" value="applications">Applications</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                    <CardDescription>Track the status of your job applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mockApplications.length > 0 ? (
                      <div className="space-y-4">
                        {mockApplications.map((application) => (
                          <div key={application.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div>
                                <h3 className="font-medium">{application.jobTitle}</h3>
                                <p className="text-sm text-muted-foreground">{application.restaurantName}</p>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  <span>{application.location}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-start md:items-end gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(application.status)}`}>
                                  {application.status}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Applied on {formatDate(application.appliedDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                        <p className="mt-2 text-muted-foreground">
                          Start applying to jobs to track your applications here.
                        </p>
                        <Button className="mt-4">
                          <Link href="/jobs">Browse Jobs</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {mockApplications.length > 0 && (
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Applications
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
              
              <TabsContent value="interviews">
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
                        Your scheduled interviews will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Jobs</CardTitle>
                    <CardDescription>Jobs you've saved for later</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No saved jobs</h3>
                      <p className="mt-2 text-muted-foreground">
                        Save jobs you're interested in to apply later.
                      </p>
                      <Button className="mt-4">
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card id="recommended-jobs">
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>Jobs that match your skills and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecommendedJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{job.title}</h3>
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.restaurantName}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="mr-1 h-3 w-3" />
                              <span>{job.jobType}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-3 w-3" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>Posted {formatDate(job.postedDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end md:self-center">
                          <Button variant="outline" size="sm">Save</Button>
                          <Button size="sm">Apply</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Link href="/jobs">View All Jobs</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card id="profile-card" className="mb-6">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">JD</span>
                  </div>
                  <h3 className="text-lg font-medium">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Head Chef</p>
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profile Completion</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full">
                  <Link href="/applicant/profile">Edit Profile</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Link href="/applicant/resume">Update Resume</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Job fairs and networking events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No upcoming events in your area.
                  </p>
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
                      <h4 className="text-sm font-medium">Featured Profile</h4>
                      <p className="text-xs text-muted-foreground">Get highlighted to employers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Early Access to Jobs</h4>
                      <p className="text-xs text-muted-foreground">Apply before others</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Application Insights</h4>
                      <p className="text-xs text-muted-foreground">See how you compare to others</p>
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
