
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building,
  ChevronLeft,
  Share2,
  Bookmark,
  Send
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Mock job data
const mockJobs = [
  {
    id: "job-1",
    title: "Head Chef",
    company: "La Bistro Restaurant",
    location: "New York, NY",
    type: "Full-time",
    salary: "$60,000 - $80,000",
    posted: "2 days ago",
    description: "We are looking for an experienced Head Chef to lead our kitchen team and create exceptional dining experiences for our guests. The ideal candidate will have a passion for culinary excellence and the ability to manage a busy kitchen environment.",
    responsibilities: [
      "Develop and implement new menu items based on seasonal ingredients and customer preferences",
      "Manage kitchen staff, including scheduling, training, and performance evaluations",
      "Ensure food quality and consistency across all dishes",
      "Maintain inventory and order supplies as needed",
      "Ensure compliance with health and safety regulations"
    ],
    requirements: [
      "5+ years of experience as a chef, with at least 2 years in a leadership role",
      "Culinary degree or equivalent training",
      "Strong knowledge of food preparation, cooking techniques, and presentation",
      "Excellent leadership and communication skills",
      "Ability to work in a fast-paced environment"
    ],
    benefits: [
      "Competitive salary",
      "Health insurance",
      "Paid time off",
      "Employee meal program",
      "Career advancement opportunities"
    ],
    companyInfo: "La Bistro is an upscale French restaurant located in the heart of New York City. We pride ourselves on using locally-sourced ingredients to create authentic French cuisine with a modern twist."
  },
  {
    id: "job-2",
    title: "Server",
    company: "Coastal Kitchen",
    location: "Miami, FL",
    type: "Part-time",
    salary: "$15 - $25/hour + tips",
    posted: "1 week ago",
    description: "Coastal Kitchen is seeking friendly and professional servers to join our team. As a server, you will be responsible for providing exceptional service to our guests and ensuring they have a memorable dining experience.",
    responsibilities: [
      "Greet guests and take food and beverage orders",
      "Make recommendations based on customer preferences",
      "Serve food and drinks in a timely manner",
      "Process payments and maintain accurate cash handling",
      "Maintain cleanliness of dining area"
    ],
    requirements: [
      "Previous serving experience preferred",
      "Knowledge of food and beverage preparation",
      "Excellent customer service skills",
      "Ability to work evenings and weekends",
      "Team player with a positive attitude"
    ],
    benefits: [
      "Flexible scheduling",
      "Meal discounts",
      "Tip sharing program",
      "Growth opportunities"
    ],
    companyInfo: "Coastal Kitchen is a popular seafood restaurant with a relaxed atmosphere and stunning ocean views. We specialize in fresh, locally-caught seafood and craft cocktails."
  }
];

export default function JobDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (id) {
      // In a real app, this would fetch from an API
      const foundJob = mockJobs.find(job => job.id === id);
      
      // Simulate API delay
      setTimeout(() => {
        setJob(foundJob || null);
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/jobs/${id}`);
      return;
    }
    
    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsApplying(false);
      router.push("/applicant/applications");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse space-y-4 w-full max-w-3xl">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-12">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-8">The job listing you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs">
            <Button>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{job.title} at {job.company} | StaffSpace</title>
        <meta name="description" content={`Apply for the ${job.title} position at ${job.company}. ${job.description.substring(0, 100)}...`} />
      </Head>

      <div className="container py-8 md:py-12">
        <div className="mb-6">
          <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to all jobs
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl">{job.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{job.company}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-1 h-4 w-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-1 h-4 w-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    Posted {job.posted}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Job Description</h3>
                    <p className="text-muted-foreground">{job.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Responsibilities</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {job.responsibilities.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {job.requirements.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Benefits</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {job.benefits.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">About {job.company}</h3>
                    <p className="text-muted-foreground">{job.companyInfo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Submit your application now and hear back from the employer soon.
                </p>
                <Button 
                  className="w-full" 
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  {isApplying ? "Submitting..." : "Apply Now"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{job.company}</h3>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Response rate: 85%</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Typically responds within 2 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockJobs
                  .filter(j => j.id !== job.id)
                  .map(similarJob => (
                    <Link 
                      href={`/jobs/${similarJob.id}`} 
                      key={similarJob.id}
                      className="block"
                    >
                      <div className="p-3 rounded-md hover:bg-muted transition-colors">
                        <h4 className="font-medium">{similarJob.title}</h4>
                        <p className="text-sm text-muted-foreground">{similarJob.company}</p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {similarJob.location}
                          <span className="mx-2">•</span>
                          <DollarSign className="mr-1 h-3 w-3" />
                          {similarJob.salary}
                        </div>
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
