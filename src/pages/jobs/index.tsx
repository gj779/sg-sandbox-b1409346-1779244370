
import Head from "next/head";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, MapPin, Filter, Clock, DollarSign, Calendar, Briefcase } from "lucide-react";

// Mock data for job listings
const mockJobs = [
  {
    id: "1",
    title: "Head Chef",
    restaurantName: "La Bistro",
    location: "New York, NY",
    description: "Experienced head chef needed for upscale French restaurant. Minimum 5 years experience required.",
    jobType: "Full-time",
    salary: {
      amount: 75000,
      period: "Yearly"
    },
    cuisineType: ["French", "Fine Dining"],
    postedDate: new Date("2025-03-20"),
    isPremium: true
  },
  {
    id: "2",
    title: "Bartender",
    restaurantName: "The Speakeasy",
    location: "Chicago, IL",
    description: "Creative bartender with mixology experience needed for busy cocktail bar.",
    jobType: "Part-time",
    salary: {
      amount: 25,
      period: "Hourly"
    },
    cuisineType: ["Cocktail Bar"],
    postedDate: new Date("2025-03-22"),
    isPremium: false
  },
  {
    id: "3",
    title: "Server",
    restaurantName: "Oceanview Grill",
    location: "Miami, FL",
    description: "Friendly and experienced server needed for busy seafood restaurant.",
    jobType: "Full-time",
    salary: {
      amount: 18,
      period: "Hourly"
    },
    cuisineType: ["Seafood", "Casual Dining"],
    postedDate: new Date("2025-03-25"),
    isPremium: true
  },
  {
    id: "4",
    title: "Sous Chef",
    restaurantName: "Pasta Palace",
    location: "Boston, MA",
    description: "Skilled sous chef with Italian cuisine experience needed for popular restaurant.",
    jobType: "Full-time",
    salary: {
      amount: 60000,
      period: "Yearly"
    },
    cuisineType: ["Italian"],
    postedDate: new Date("2025-03-18"),
    isPremium: false
  },
  {
    id: "5",
    title: "Event Staff",
    restaurantName: "Grand Ballroom",
    location: "Los Angeles, CA",
    description: "Event staff needed for upscale catering company. Weekend availability required.",
    jobType: "Event",
    salary: {
      amount: 22,
      period: "Hourly"
    },
    cuisineType: ["Catering", "Events"],
    postedDate: new Date("2025-03-24"),
    eventDate: new Date("2025-04-15"),
    isPremium: false
  }
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<string | undefined>(undefined);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [showNoResults, setShowNoResults] = useState(false);

  const handleSearch = () => {
    const filtered = mockJobs.filter(job => {
      const matchesSearch = searchTerm === "" || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = location === "" ||
        job.location.toLowerCase().includes(location.toLowerCase());
      
      const matchesJobType = !jobType || job.jobType === jobType;
      
      return matchesSearch && matchesLocation && matchesJobType;
    });
    
    setFilteredJobs(filtered);
    setShowNoResults(filtered.length === 0);
  };

  const formatSalary = (salary: { amount: number, period: string }) => {
    if (salary.period === "Hourly") {
      return `$${salary.amount}/hr`;
    } else if (salary.period === "Yearly") {
      return `$${salary.amount.toLocaleString()}/year`;
    }
    return `$${salary.amount}/${salary.period.toLowerCase()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>Browse Jobs | StaffSpace</title>
        <meta name="description" content="Find restaurant and hospitality jobs that match your skills and availability." />
      </Head>

      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Jobs</h1>
            <p className="text-muted-foreground">Find restaurant and hospitality jobs that match your skills and availability</p>
          </div>
          <Button className="mt-4 md:mt-0">
            <Filter className="mr-2 h-4 w-4" /> Advanced Filters
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-lg p-4 shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Job title, keywords, or restaurant"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Location"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="full-time">Full-time</TabsTrigger>
            <TabsTrigger value="part-time">Part-time</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {showNoResults ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-medium mb-2">No job listings found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                  setJobType(undefined);
                  setFilteredJobs(mockJobs);
                  setShowNoResults(false);
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className={`job-card ${job.isPremium ? 'border-primary/50' : ''}`}>
                    {job.isPremium && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="default" className="bg-primary">Featured</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-base mt-1">{job.restaurantName}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          {job.cuisineType.map((cuisine) => (
                            <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{job.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                      </div>
                      {job.eventDate && (
                        <div className="mt-4 flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Event Date: {formatDate(job.eventDate)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Posted {formatDate(job.postedDate)}</span>
                      </div>
                      <Button>Apply Now</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="full-time">
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs
                .filter(job => job.jobType === "Full-time")
                .map((job) => (
                  <Card key={job.id} className={`job-card ${job.isPremium ? 'border-primary/50' : ''}`}>
                    {/* Same card content as above */}
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-base mt-1">{job.restaurantName}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          {job.cuisineType.map((cuisine) => (
                            <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{job.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Posted {formatDate(job.postedDate)}</span>
                      </div>
                      <Button>Apply Now</Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          {/* Similar content for other tabs */}
          <TabsContent value="part-time">
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs
                .filter(job => job.jobType === "Part-time")
                .map((job) => (
                  <Card key={job.id} className="job-card">
                    {/* Card content */}
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-base mt-1">{job.restaurantName}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          {job.cuisineType.map((cuisine) => (
                            <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{job.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Posted {formatDate(job.postedDate)}</span>
                      </div>
                      <Button>Apply Now</Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="event">
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs
                .filter(job => job.jobType === "Event")
                .map((job) => (
                  <Card key={job.id} className="job-card">
                    {/* Card content */}
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="text-base mt-1">{job.restaurantName}</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          {job.cuisineType.map((cuisine) => (
                            <Badge key={cuisine} variant="secondary">{cuisine}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{job.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                      </div>
                      {job.eventDate && (
                        <div className="mt-4 flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Event Date: {formatDate(job.eventDate)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Posted {formatDate(job.postedDate)}</span>
                      </div>
                      <Button>Apply Now</Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
