import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { firebaseAdminService } from "@/services/firebaseAdmin";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  UserPlus,
  Building,
  CalendarClock
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userProfile, isLoading } = useFirebaseAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!userProfile || userProfile.userType !== "admin")) {
      router.push("/");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          firebaseAdminService.getSystemStats(),
          firebaseAdminService.getRecentActivity(10)
        ]);
        
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (userProfile?.userType === "admin") {
      fetchAdminData();
    }
  }, [isLoading, userProfile, router]);

  if (isLoading || isLoadingData) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.userType !== "admin") {
    return null; // Will redirect in useEffect
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "job_created":
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case "application_submitted":
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.type) {
      case "user_registered":
        return `New ${activity.data.userType}: ${activity.data.firstName} ${activity.data.lastName}`;
      case "job_created":
        return `New job posted: ${activity.data.title}`;
      case "application_submitted":
        return `New application submitted for job ID: ${activity.data.jobId}`;
      default:
        return "Activity";
    }
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard | StaffSpace</title>
        <meta name="description" content="Admin dashboard for StaffSpace platform management" />
      </Head>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, jobs, and applications on the StaffSpace platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/admin/users")}>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
            <Button onClick={() => router.push("/admin/jobs")}>
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Jobs
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">{stats?.totalApplicants || 0}</span> Applicants
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-primary">{stats?.totalRestaurants || 0}</span> Restaurants
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-green-500">{stats?.activeJobs || 0}</span> Active
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-muted-foreground">{(stats?.totalJobs || 0) - (stats?.activeJobs || 0)}</span> Inactive
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total job applications submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalJobs && stats?.totalApplications
                  ? `${((stats.totalApplications / stats.totalJobs) || 0).toFixed(1)}`
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average applications per job
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getActivityTitle(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No recent activity found</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                  onClick={() => router.push("/admin/users/create")}
                >
                  <UserPlus className="h-6 w-6" />
                  <span className="text-sm">Add User</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                  onClick={() => router.push("/admin/jobs/review")}
                >
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-sm">Review Jobs</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                  onClick={() => router.push("/admin/reports")}
                >
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                  onClick={() => router.push("/admin/settings")}
                >
                  <Building className="h-6 w-6" />
                  <span className="text-sm">Platform Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
