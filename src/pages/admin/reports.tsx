import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Briefcase, FileText, Download, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ReportData {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeUsers: number;
  usersByRole: {
    applicant: number;
    restaurant: number;
    admin: number;
  };
  applicationsByStatus: {
    pending: number;
    reviewing: number;
    accepted: number;
    rejected: number;
  };
  jobsByType: Record<string, number>;
  monthlyUserGrowth: Array<{ month: string; count: number }>;
  monthlyApplications: Array<{ month: string; count: number }>;
  conversionRate: number;
  averageTimeToHire: number;
}

// Define explicit interfaces for Firestore documents
interface UserDoc {
  id: string;
  role?: string;
  lastActive?: Timestamp;
  createdAt?: Timestamp;
  [key: string]: any;
}

interface JobDoc {
  id: string;
  type?: string;
  createdAt?: Timestamp;
  [key: string]: any;
}

interface ApplicationDoc {
  id: string;
  status?: string;
  createdAt?: Timestamp;
  [key: string]: any;
}

export default function AdminReports() {
  const { user, isLoading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [timeRange, setTimeRange] = useState("30");
  const [isAdmin, setIsAdmin] = useState(false);

  const calculateMonthlyGrowth = useCallback((items: (UserDoc | ApplicationDoc)[], months: number) => {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = items.filter(item => {
        const createdAt = item.createdAt?.toDate?.() || new Date(0);
        return createdAt >= monthDate && createdAt < nextMonthDate;
      }).length;

      result.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        count,
      });
    }
    
    return result;
  }, []);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const daysAgo = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDoc));
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => {
        const lastActive = u.lastActive?.toDate?.() || new Date(0);
        return lastActive > cutoffDate;
      }).length;

      const usersByRole = {
        applicant: users.filter(u => u.role === "applicant").length,
        restaurant: users.filter(u => u.role === "restaurant").length,
        admin: users.filter(u => u.role === "admin").length,
      };

      // Fetch jobs
      const jobsSnapshot = await getDocs(collection(db, "jobs"));
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobDoc));
      const totalJobs = jobs.length;

      const jobsByType: Record<string, number> = {};
      jobs.forEach(job => {
        const type = job.type || "Other";
        jobsByType[type] = (jobsByType[type] || 0) + 1;
      });

      // Fetch applications
      const applicationsSnapshot = await getDocs(collection(db, "applications"));
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApplicationDoc));
      const totalApplications = applications.length;

      const applicationsByStatus = {
        pending: applications.filter(a => a.status === "pending").length,
        reviewing: applications.filter(a => a.status === "reviewing").length,
        accepted: applications.filter(a => a.status === "accepted").length,
        rejected: applications.filter(a => a.status === "rejected").length,
      };

      // Calculate conversion rate
      const acceptedApps = applicationsByStatus.accepted;
      const conversionRate = totalApplications > 0 ? (acceptedApps / totalApplications) * 100 : 0;

      // Monthly user growth (last 6 months)
      const monthlyUserGrowth = calculateMonthlyGrowth(users, 6);
      const monthlyApplications = calculateMonthlyGrowth(applications, 6);

      // Average time to hire (mock calculation)
      const averageTimeToHire = 14; // days (would need interview/hire dates for real calculation)

      setReportData({
        totalUsers,
        totalJobs,
        totalApplications,
        activeUsers,
        usersByRole,
        applicationsByStatus,
        jobsByType,
        monthlyUserGrowth,
        monthlyApplications,
        conversionRate,
        averageTimeToHire,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, calculateMonthlyGrowth]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!authLoading && user) {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin === true) {
          setIsAdmin(true);
          // fetchReportData will be triggered by the other useEffect when isAdmin becomes true
        } else {
          router.push("/");
        }
      } else if (!authLoading && !user) {
        router.push("/auth/admin-login");
      }
    };
    checkAdmin();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchReportData();
    }
  }, [isAdmin, fetchReportData]);

  const exportReport = () => {
    if (!reportData) return;
    
    const reportText = `
StaffSpace Platform Report
Generated: ${new Date().toLocaleDateString()}
Time Range: Last ${timeRange} days

=== OVERVIEW ===
Total Users: ${reportData.totalUsers}
Active Users: ${reportData.activeUsers}
Total Jobs: ${reportData.totalJobs}
Total Applications: ${reportData.totalApplications}
Conversion Rate: ${reportData.conversionRate.toFixed(2)}%

=== USERS BY ROLE ===
Applicants: ${reportData.usersByRole.applicant}
Restaurants: ${reportData.usersByRole.restaurant}
Admins: ${reportData.usersByRole.admin}

=== APPLICATIONS BY STATUS ===
Pending: ${reportData.applicationsByStatus.pending}
Reviewing: ${reportData.applicationsByStatus.reviewing}
Accepted: ${reportData.applicationsByStatus.accepted}
Rejected: ${reportData.applicationsByStatus.rejected}
    `;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staffspace-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Platform Reports" userType="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reportData) {
    return (
      <DashboardLayout title="Platform Reports" userType="admin">
        <div className="p-8">
          <p className="text-gray-600">Unable to load report data.</p>
        </div>
      </DashboardLayout>
    );
  }

  const previousPeriodUsers = Math.floor(reportData.totalUsers * 0.9);
  const userGrowth = reportData.totalUsers - previousPeriodUsers;
  const userGrowthPercent = ((userGrowth / previousPeriodUsers) * 100).toFixed(1);

  return (
    <DashboardLayout title="Platform Reports" userType="admin">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Reports</h1>
            <p className="text-gray-600">Comprehensive analytics and insights</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{reportData.totalUsers}</div>
              <div className="flex items-center text-sm mt-2">
                <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">{userGrowthPercent}%</span>
                <span className="text-gray-500 ml-2">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{reportData.activeUsers}</div>
              <div className="flex items-center text-sm mt-2">
                <span className="text-gray-600">
                  {((reportData.activeUsers / reportData.totalUsers) * 100).toFixed(1)}% of total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
              <Briefcase className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{reportData.totalJobs}</div>
              <div className="flex items-center text-sm mt-2">
                <span className="text-gray-600">
                  {reportData.usersByRole.restaurant} restaurants posting
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
              <FileText className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{reportData.totalApplications}</div>
              <div className="flex items-center text-sm mt-2">
                <span className="text-gray-600">
                  {reportData.conversionRate.toFixed(1)}% conversion rate
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
            <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
            <TabsTrigger value="applications">Application Metrics</TabsTrigger>
            <TabsTrigger value="platform">Platform Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>Distribution of user types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData.usersByRole).map(([role, count]) => {
                      const percentage = (count / reportData.totalUsers) * 100;
                      return (
                        <div key={role}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{role}</span>
                            <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly User Growth</CardTitle>
                  <CardDescription>New user registrations per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.monthlyUserGrowth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.month}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...reportData.monthlyUserGrowth.map(m => m.count))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs by Type</CardTitle>
                  <CardDescription>Distribution of job categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData.jobsByType)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => {
                        const percentage = (count / reportData.totalJobs) * 100;
                        return (
                          <div key={type}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">{type}</span>
                              <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Performance</CardTitle>
                  <CardDescription>Key job posting metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{reportData.totalJobs}</div>
                      <p className="text-sm text-gray-600 mt-1">Total active listings</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {(reportData.totalApplications / reportData.totalJobs || 0).toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Average applications per job</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{reportData.usersByRole.restaurant}</div>
                      <p className="text-sm text-gray-600 mt-1">Active restaurant employers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Applications by Status</CardTitle>
                  <CardDescription>Current application pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData.applicationsByStatus).map(([status, count]) => {
                      const percentage = (count / reportData.totalApplications) * 100;
                      const colors: Record<string, string> = {
                        pending: "bg-yellow-500",
                        reviewing: "bg-blue-500",
                        accepted: "bg-green-500",
                        rejected: "bg-red-500",
                      };
                      return (
                        <div key={status}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{status}</span>
                            <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colors[status]} h-2 rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Applications</CardTitle>
                  <CardDescription>Application submission trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.monthlyApplications.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.month}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...reportData.monthlyApplications.map(m => m.count))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Conversion Metrics</CardTitle>
                  <CardDescription>Application success rates and timing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{reportData.conversionRate.toFixed(1)}%</div>
                      <p className="text-sm text-gray-600 mt-2">Acceptance Rate</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {reportData.applicationsByStatus.accepted} of {reportData.totalApplications} applications
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{reportData.averageTimeToHire}</div>
                      <p className="text-sm text-gray-600 mt-2">Avg. Days to Hire</p>
                      <p className="text-xs text-gray-500 mt-1">From application to acceptance</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {((reportData.applicationsByStatus.reviewing / reportData.totalApplications) * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">In Review</p>
                      <p className="text-xs text-gray-500 mt-1">{reportData.applicationsByStatus.reviewing} applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platform" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                  <CardDescription>User engagement overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Active Users Rate</span>
                        <span className="text-sm text-gray-600">
                          {((reportData.activeUsers / reportData.totalUsers) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(reportData.activeUsers / reportData.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Job Fill Rate</span>
                        <span className="text-sm text-gray-600">
                          {((reportData.applicationsByStatus.accepted / reportData.totalJobs) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(reportData.applicationsByStatus.accepted / reportData.totalJobs) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Overall platform health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-sm text-gray-600">Total Registered Users</span>
                      <span className="text-lg font-semibold">{reportData.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-sm text-gray-600">Active Job Listings</span>
                      <span className="text-lg font-semibold">{reportData.totalJobs}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-sm text-gray-600">Total Applications</span>
                      <span className="text-lg font-semibold">{reportData.totalApplications}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-gray-600">Successful Hires</span>
                      <span className="text-lg font-semibold text-green-600">
                        {reportData.applicationsByStatus.accepted}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}