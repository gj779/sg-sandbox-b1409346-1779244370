import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle 
} from "lucide-react";

// Mock data for analytics
const applicationStatusData = [
  { name: "Applied", value: 12, color: "#3b82f6" },
  { name: "Viewed", value: 8, color: "#8b5cf6" },
  { name: "In Review", value: 5, color: "#f59e0b" },
  { name: "Interview", value: 3, color: "#10b981" },
  { name: "Offered", value: 1, color: "#059669" },
  { name: "Rejected", value: 2, color: "#ef4444" }
];

const weeklyActivityData = [
  { name: "Mon", applications: 2, messages: 5, views: 8 },
  { name: "Tue", applications: 3, messages: 4, views: 10 },
  { name: "Wed", applications: 1, messages: 7, views: 12 },
  { name: "Thu", applications: 4, messages: 3, views: 15 },
  { name: "Fri", applications: 2, messages: 6, views: 9 },
  { name: "Sat", applications: 0, messages: 2, views: 5 },
  { name: "Sun", applications: 1, messages: 1, views: 4 }
];

const jobCategoryData = [
  { name: "Chef", value: 8, color: "#3b82f6" },
  { name: "Server", value: 12, color: "#8b5cf6" },
  { name: "Bartender", value: 5, color: "#f59e0b" },
  { name: "Manager", value: 3, color: "#10b981" },
  { name: "Host", value: 4, color: "#059669" }
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  try {
    // Safe type casting to prevent NaN when Recharts passes undefined/string values
    const iR = Number(innerRadius) || 0;
    const oR = Number(outerRadius) || 0;
    const radius = iR + (oR - iR) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  } catch (error) {
    console.error('Error rendering chart label:', error);
    return null;
  }
};

interface AnalyticsDashboardProps {
  userType: "applicant" | "restaurant";
}

export default function AnalyticsDashboard({ userType }: AnalyticsDashboardProps) {
  
  // Stats cards data based on user type
  const statsCards = userType === 'applicant' 
    ? [
        { title: 'Applications', value: '31', icon: <CheckCircle className='h-4 w-4 text-green-500' />, description: 'Total job applications' },
        { title: 'Profile Views', value: '124', icon: <Eye className='h-4 w-4 text-blue-500' />, description: 'Times your profile was viewed' },
        { title: 'Interviews', value: '8', icon: <Calendar className='h-4 w-4 text-purple-500' />, description: 'Scheduled interviews' },
        { title: 'Messages', value: '47', icon: <MessageSquare className='h-4 w-4 text-yellow-500' />, description: 'Conversations with employers' }
      ]
    : [
        { title: 'Active Listings', value: '12', icon: <TrendingUp className='h-4 w-4 text-green-500' />, description: 'Current job postings' },
        { title: 'Applicants', value: '87', icon: <Users className='h-4 w-4 text-blue-500' />, description: 'Total job applicants' },
        { title: 'Interviews', value: '23', icon: <Calendar className='h-4 w-4 text-purple-500' />, description: 'Scheduled interviews' },
        { title: 'Hired', value: '14', icon: <CheckCircle className='h-4 w-4 text-green-500' />, description: 'Positions filled' }
      ];

  return (
    <div className='space-y-6'>
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue='activity' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='activity'>Activity</TabsTrigger>
          <TabsTrigger value='applications'>Applications</TabsTrigger>
          {userType === 'applicant' && <TabsTrigger value='jobs'>Job Categories</TabsTrigger>}
          {userType === 'restaurant' && <TabsTrigger value='applicants'>Applicant Stats</TabsTrigger>}
        </TabsList>
        
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          {/* Activity Chart */}
          <TabsContent value='activity' className='space-y-4 lg:col-span-4'>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Your activity over the past week
                </CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <div className='h-[300px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={weeklyActivityData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='name' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='views' fill='#3b82f6' name='Profile Views' />
                      <Bar dataKey='messages' fill='#8b5cf6' name='Messages' />
                      <Bar dataKey='applications' fill='#10b981' name={userType === 'applicant' ? 'Applications' : 'Applicants'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Status Chart */}
          <TabsContent value='applications' className='space-y-4 lg:col-span-3'>
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>
                  Breakdown of your application statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-[300px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {applicationStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Categories Chart (Applicant only) */}
          {userType === 'applicant' && (
            <TabsContent value='jobs' className='space-y-4 lg:col-span-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                  <CardDescription>
                    Types of jobs you've applied to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-[300px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={jobCategoryData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {jobCategoryData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Applicant Stats (Restaurant only) */}
          {userType === 'restaurant' && (
            <TabsContent value='applicants' className='space-y-4 lg:col-span-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Applicant Qualifications</CardTitle>
                  <CardDescription>
                    Experience level of your applicants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='h-[300px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Entry Level", value: 45, color: "#3b82f6" },
                            { name: "Mid Level", value: 30, color: "#8b5cf6" },
                            { name: "Senior", value: 15, color: "#f59e0b" },
                            { name: "Executive", value: 10, color: "#10b981" }
                          ]}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {[
                            { name: "Entry Level", value: 45, color: "#3b82f6" },
                            { name: "Mid Level", value: 30, color: "#8b5cf6" },
                            { name: "Senior", value: 15, color: "#f59e0b" },
                            { name: "Executive", value: 10, color: "#10b981" }
                          ].map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}