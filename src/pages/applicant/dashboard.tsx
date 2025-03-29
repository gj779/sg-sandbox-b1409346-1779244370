import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  ChevronRight,
  Building,
  MessageSquare,
  Search,
  User
} from "lucide-react";
import TutorialGuide from "@/components/common/TutorialGuide";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import UpcomingInterviews from '@/components/dashboard/UpcomingInterviews';
import RecentApplications from '@/components/dashboard/RecentApplications';

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
  const { user, isAuthenticated } = useUser();
  const router = useRouter();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className='container py-12 text-center'>
        <h1 className='text-2xl font-bold mb-4'>Please Sign In</h1>
        <p className='text-muted-foreground mb-6'>You need to be signed in to view your dashboard.</p>
        <Button onClick={() => router.push('/auth/login?redirect=/applicant/dashboard')}>
          Sign In
        </Button>
      </div>
    );
  }

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
        <title>Applicant Dashboard | StaffSpace</title>
        <meta name='description' content='Manage your job applications, interviews, and profile on StaffSpace.' />
      </Head>

      <div className='container py-8 md:py-12'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight mb-2'>Applicant Dashboard</h1>
            <p className='text-muted-foreground'>Welcome back, {user?.name || 'User'}</p>
          </div>
          <div className='flex gap-2 mt-4 md:mt-0'>
            <Link href='/jobs'>
              <Button>
                <Search className='mr-2 h-4 w-4' /> Find Jobs
              </Button>
            </Link>
            <Link href='/applicant/create-resume'>
              <Button variant='outline'>
                <User className='mr-2 h-4 w-4' /> Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='applications'>Applications</TabsTrigger>
            <TabsTrigger value='interviews'>Interviews</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>Applications</CardTitle>
                  <Briefcase className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{mockApplications.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    {mockApplications.length} applications
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>Interviews</CardTitle>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>2</div>
                  <p className='text-xs text-muted-foreground'>
                    2 upcoming interviews
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>Saved Jobs</CardTitle>
                  <Star className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>8</div>
                  <p className='text-xs text-muted-foreground'>
                    4 new jobs match your preferences
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <CardTitle className='text-sm font-medium'>Messages</CardTitle>
                  <MessageSquare className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>47</div>
                  <p className='text-xs text-muted-foreground'>
                    2 unread messages
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <UpcomingInterviews userType='applicant' />
              <RecentApplications />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>
                  Jobs that match your skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {mockRecommendedJobs.map((job) => (
                    <div key={job.id} className='border rounded-lg p-4'>
                      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <div>
                          <h3 className='font-medium'>{job.title}</h3>
                          <p className='text-sm text-muted-foreground mb-2'>{job.restaurantName}</p>
                          <div className='flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground'>
                            <div className='flex items-center'>
                              <MapPin className='mr-1.5 h-4 w-4' />
                              {job.location}
                            </div>
                            <div className='flex items-center'>
                              <Building className='mr-1.5 h-4 w-4' />
                              {job.jobType}
                            </div>
                            <div className='flex items-center'>
                              <Clock className='mr-1.5 h-4 w-4' />
                              Posted {formatDate(job.postedDate)}
                            </div>
                          </div>
                        </div>
                        <Link href={`/jobs/${job.id}`}>
                          <Button size='sm'>
                            View Job
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className='p-4 border-t'>
                <Link href='/jobs'>
                  <Button variant='outline' className='w-full'>
                    View All Jobs
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value='applications'>
            <Card>
              <CardHeader>
                <CardTitle>Your Applications</CardTitle>
                <CardDescription>
                  Track and manage your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {mockApplications.map((application) => (
                    <div key={application.id} className='border rounded-lg p-4'>
                      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='font-medium'>{application.jobTitle}</h3>
                            <Badge variant='outline' className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground mb-2'>{application.restaurantName}</p>
                          <div className='flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground'>
                            <div className='flex items-center'>
                              <MapPin className='mr-1.5 h-4 w-4' />
                              {application.location}
                            </div>
                            <div className='flex items-center'>
                              <Calendar className='mr-1.5 h-4 w-4' />
                              Applied: {formatDate(application.appliedDate)}
                            </div>
                          </div>
                        </div>
                        <div className='flex gap-2 self-end md:self-center'>
                          <Link href={`/messaging?conversation=${application.restaurantName}`}>
                            <Button variant='outline' size='sm' className='relative'>
                              <MessageSquare className='h-4 w-4 mr-1' />
                              Message
                              <span className='absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full' />
                            </Button>
                          </Link>
                          <Link href={`/applications/${application.id}`}>
                            <Button size='sm'>
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className='p-4 border-t'>
                <Link href='/applications'>
                  <Button variant='outline' className='w-full'>
                    View All Applications
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value='interviews'>
            <UpcomingInterviews userType='applicant' />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value='analytics'>
            <AnalyticsDashboard userType='applicant' />
          </TabsContent>
        </Tabs>
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