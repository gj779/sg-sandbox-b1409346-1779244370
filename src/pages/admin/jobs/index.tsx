import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, 
  Search, 
  MoreHorizontal, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import { firebaseAdminService } from "@/services/firebaseAdmin";
import { firebaseJobsService, JobListing } from "@/services/firebaseJobs";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export default function AdminJobsPage() {
  const router = useRouter();
  const { userProfile, isLoading } = useFirebaseAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!userProfile || userProfile.userType !== "admin")) {
      router.push("/");
      return;
    }

    const fetchJobs = async () => {
      try {
        const allJobs = await firebaseAdminService.getAllJobListings();
        setJobs(allJobs);
        setFilteredJobs(allJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (userProfile?.userType === "admin") {
      fetchJobs();
    }
  }, [isLoading, userProfile, router]);

  useEffect(() => {
    // Filter jobs based on search query, job type, and status
    let filtered = jobs;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) || 
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }
    
    if (selectedJobType !== "all") {
      filtered = filtered.filter(job => job.jobType === selectedJobType);
    }
    
    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        filtered = filtered.filter(job => job.isActive);
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter(job => !job.isActive);
      } else if (selectedStatus === "approved") {
        filtered = filtered.filter(job => job.isApproved);
      } else if (selectedStatus === "rejected") {
        filtered = filtered.filter(job => job.isApproved === false);
      } else if (selectedStatus === "pending") {
        filtered = filtered.filter(job => job.isApproved === undefined);
      }
    }
    
    setFilteredJobs(filtered);
  }, [searchQuery, selectedJobType, selectedStatus, jobs]);

  const handleApproveJob = async (jobId: string) => {
    try {
      await firebaseAdminService.approveJobListing(jobId);
      
      // Update the job in the local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, isApproved: true, approvedAt: new Date() } 
            : job
        )
      );
    } catch (error) {
      console.error("Error approving job:", error);
    }
  };

  const handleRejectJob = async () => {
    if (!selectedJobId) return;
    
    try {
      await firebaseAdminService.rejectJobListing(selectedJobId, rejectionReason);
      
      // Update the job in the local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === selectedJobId 
            ? { ...job, isApproved: false, rejectionReason } 
            : job
        )
      );
      
      // Close dialog and reset state
      setIsDialogOpen(false);
      setRejectionReason("");
      setSelectedJobId(null);
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  const handleToggleJobStatus = async (jobId: string, isActive: boolean) => {
    try {
      await firebaseJobsService.updateJobListing(jobId, { isActive: !isActive });
      
      // Update the job in the local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, isActive: !isActive } 
            : job
        )
      );
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatSalary = (job: JobListing) => {
    if (!job.salary) return "Not specified";
    
    const { min, max, rate } = job.salary;
    
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${rate}`;
    } else if (min) {
      return `$${min.toLocaleString()} ${rate}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()} ${rate}`;
    }
    
    return "Not specified";
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.userType !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Head>
        <title>Manage Jobs | Admin Dashboard | StaffSpace</title>
        <meta name="description" content="Manage job listings on the StaffSpace platform" />
      </Head>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/admin/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Job Listings</CardTitle>
                <CardDescription>
                  Manage all job listings on the StaffSpace platform
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedStatus === "all" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus("all")}
                >
                  All ({jobs.length})
                </Badge>
                <Badge variant={selectedStatus === "active" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus("active")}
                >
                  Active ({jobs.filter(j => j.isActive).length})
                </Badge>
                <Badge variant={selectedStatus === "inactive" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus("inactive")}
                >
                  Inactive ({jobs.filter(j => !j.isActive).length})
                </Badge>
                <Badge variant={selectedStatus === "pending" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus("pending")}
                >
                  Pending Review ({jobs.filter(j => j.isApproved === undefined).length})
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                >
                  <option value="all">All Job Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell>{job.restaurantId}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {job.jobType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {job.isActive ? (
                            <Badge variant="success" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                          {job.isApproved === true && (
                            <Badge variant="outline" className="ml-1 bg-blue-100 text-blue-800">
                              Approved
                            </Badge>
                          )}
                          {job.isApproved === false && (
                            <Badge variant="outline" className="ml-1 bg-red-100 text-red-800">
                              Rejected
                            </Badge>
                          )}
                          {job.isApproved === undefined && (
                            <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {job.isApproved === undefined && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApproveJob(job.id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Listing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedJobId(job.id);
                                    setIsDialogOpen(true);
                                  }}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Listing
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleToggleJobStatus(job.id, job.isActive)}>
                                {job.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No jobs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Job Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this job listing. This will be visible to the restaurant owner.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectJob}
              disabled={!rejectionReason.trim()}
            >
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
