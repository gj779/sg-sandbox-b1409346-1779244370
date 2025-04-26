import Head from "next/head";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
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
import {
  Search,
  MapPin,
  Filter,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Star,
  StarOff,
  Sliders
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

// Mock data for job listings (assuming this is static and consistent)
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
    postedDate: "2025-03-20",
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
    postedDate: "2025-03-22",
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
    postedDate: "2025-03-25",
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
    postedDate: "2025-03-18",
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
    postedDate: "2025-03-24",
    eventDate: "2025-04-15",
    isPremium: false
  }
];

// Consistent date formatting function
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Date not specified";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Consistent salary formatting function
const formatSalary = (salary: { amount: number; period: string } | undefined): string => {
  if (!salary) return "Salary not specified";
  try {
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

export default function JobsPage() {
  const { user, isAuthenticated } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<string | undefined>(undefined);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs); // Initial state from static data
  const [showNoResults, setShowNoResults] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100000]);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [datePosted, setDatePosted] = useState<string | undefined>(undefined);
  
  // State potentially dependent on client-side (e.g., localStorage)
  const [savedSearches, setSavedSearches] = useState<Array<{id: string, name: string, filters: any}>>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // State to prevent hydration mismatch for client-only elements
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);
    // If savedJobs/savedSearches were loaded from localStorage, it would happen here
    // Example: setSavedJobs(JSON.parse(localStorage.getItem('savedJobs') || '[]'));
  }, []);

  // All available cuisine types from the mock data
  const allCuisineTypes = Array.from(
    new Set(mockJobs.flatMap(job => job.cuisineType))
  );

  // Use useCallback for functions used in effects or passed down
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = mockJobs.filter(job => {
      // Basic search filters
      const matchesSearch = searchTerm === "" || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = location === "" ||
        job.location.toLowerCase().includes(location.toLowerCase());
      
      const matchesJobType = !jobType || job.jobType === jobType;
      
      // Advanced filters
      const salaryAmount = job.salary?.amount;
      const salaryPeriod = job.salary?.period;
      let matchesSalary = true; // Default to true if salary info is missing
      if (salaryAmount !== undefined && salaryPeriod) {
         matchesSalary = 
          (salaryPeriod === "Yearly" && salaryAmount >= salaryRange[0] && salaryAmount <= salaryRange[1]) ||
          (salaryPeriod === "Hourly" && (salaryAmount * 2080) >= salaryRange[0] && (salaryAmount * 2080) <= salaryRange[1]);
      }

      const matchesCuisine = cuisineTypes.length === 0 || 
        (job.cuisineType && job.cuisineType.some(cuisine => cuisineTypes.includes(cuisine)));
      
      // Date posted filter
      let matchesDatePosted = true;
      if (datePosted && job.postedDate) {
        try {
          const today = new Date();
          const jobDate = new Date(job.postedDate);
          if (!isNaN(jobDate.getTime())) { // Check if date is valid
            const daysDifference = Math.floor((today.getTime() - jobDate.getTime()) / (1000 * 3600 * 24));
            
            switch(datePosted) {
              case 'today':
                matchesDatePosted = daysDifference < 1;
                break;
              case 'week':
                matchesDatePosted = daysDifference < 7;
                break;
              case 'month':
                matchesDatePosted = daysDifference < 30;
                break;
            }
          } else {
             matchesDatePosted = false; // Invalid job date doesn't match filter
          }
        } catch (e) {
           matchesDatePosted = false; // Error parsing date
        }
      }
      
      return matchesSearch && matchesLocation && matchesJobType && 
             matchesSalary && matchesCuisine && matchesDatePosted;
    });
    
    // Update active filters list
    const newActiveFilters = [];
    if (searchTerm) newActiveFilters.push(`Keyword: ${searchTerm}`);
    if (location) newActiveFilters.push(`Location: ${location}`);
    if (jobType) newActiveFilters.push(`Job Type: ${jobType}`);
    if (cuisineTypes.length > 0) newActiveFilters.push(`Cuisines: ${cuisineTypes.join(', ')}`);
    if (datePosted) {
      const dateLabels = {
        'today': 'Today',
        'week': 'Past Week',
        'month': 'Past Month'
      };
      newActiveFilters.push(`Posted: ${dateLabels[datePosted as keyof typeof dateLabels]}`);
    }
    if (salaryRange[0] > 0 || salaryRange[1] < 100000) {
      newActiveFilters.push(`Salary: $${salaryRange[0].toLocaleString()} - $${salaryRange[1].toLocaleString()}`);
    }
    
    setActiveFilters(newActiveFilters);
    setFilteredJobs(filtered);
    setShowNoResults(filtered.length === 0);
  }, [searchTerm, location, jobType, salaryRange, cuisineTypes, datePosted]); // Dependencies for the filter logic

  // Effect to run search when filters change
  useEffect(() => {
    // Check if we're on the client side before applying filters
    if (typeof window !== 'undefined') {
      try {
        applyFiltersAndSearch();
      } catch (error) {
        console.error('Error applying filters:', error);
      }
    }
  }, [searchTerm, location, jobType, salaryRange, cuisineTypes, datePosted]); // List all dependencies directly instead of using the memoized function

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setLocation("");
    setJobType(undefined);
    setSalaryRange([0, 100000]);
    setCuisineTypes([]);
    setDatePosted(undefined);
    // applyFiltersAndSearch will be called by the useEffect above
  }, [applyFiltersAndSearch]); // Depend on the memoized function

  // Remove a specific filter
  const removeFilter = useCallback((filter: string) => {
    const filterType = filter.split(":")[0].trim();
    
    let needsUpdate = false;
    switch(filterType) {
      case "Keyword":
        if (searchTerm !== "") { setSearchTerm(""); needsUpdate = true; }
        break;
      case "Location":
         if (location !== "") { setLocation(""); needsUpdate = true; }
        break;
      case "Job Type":
         if (jobType !== undefined) { setJobType(undefined); needsUpdate = true; }
        break;
      case "Cuisines":
         if (cuisineTypes.length > 0) { setCuisineTypes([]); needsUpdate = true; }
        break;
      case "Posted":
         if (datePosted !== undefined) { setDatePosted(undefined); needsUpdate = true; }
        break;
      case "Salary":
         if (salaryRange[0] > 0 || salaryRange[1] < 100000) { setSalaryRange([0, 100000]); needsUpdate = true; }
        break;
    }
    // The useEffect listening to filter changes will trigger applyFiltersAndSearch
  }, [searchTerm, location, jobType, cuisineTypes, datePosted, salaryRange]); // Dependencies

  // Save current search
  const saveCurrentSearch = useCallback(() => {
    if (!isAuthenticated || !isClient) return; // Ensure client-side and authenticated
    
    const searchName = `Search ${savedSearches.length + 1}`;
    const newSavedSearch = {
      id: `search_${Date.now()}`,
      name: searchName,
      filters: {
        searchTerm,
        location,
        jobType,
        salaryRange,
        cuisineTypes,
        datePosted
      }
    };
    
    const updatedSearches = [...savedSearches, newSavedSearch];
    setSavedSearches(updatedSearches);
    // Optionally save to localStorage here if needed
    // localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
  }, [isAuthenticated, isClient, savedSearches, searchTerm, location, jobType, salaryRange, cuisineTypes, datePosted]);

  // Load a saved search
  const loadSavedSearch = useCallback((search: any) => {
    setSearchTerm(search.filters.searchTerm || "");
    setLocation(search.filters.location || "");
    setJobType(search.filters.jobType);
    setSalaryRange(search.filters.salaryRange || [0, 100000]);
    setCuisineTypes(search.filters.cuisineTypes || []);
    setDatePosted(search.filters.datePosted);
    // applyFiltersAndSearch will be called by the useEffect listening to filter changes
  }, [applyFiltersAndSearch]);

  // Toggle job saved status
  const toggleSaveJob = useCallback((jobId: string) => {
    if (!isAuthenticated || !isClient) return; // Ensure client-side and authenticated
    
    setSavedJobs(prevSavedJobs => {
      const updatedSavedJobs = prevSavedJobs.includes(jobId)
        ? prevSavedJobs.filter(id => id !== jobId)
        : [...prevSavedJobs, jobId];
      // Optionally save to localStorage here if needed
      // localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
      return updatedSavedJobs;
    });
  }, [isAuthenticated, isClient]);

  // Render function for a single job card to avoid repetition
  const renderJobCard = (job: typeof mockJobs[0]) => (
     <Card key={job.id} className={`job-card relative ${job.isPremium ? 'border-primary/50' : ''}`}>
        {job.isPremium && (
          <div className="absolute top-4 right-4">
            <Badge variant="default" className="bg-primary">Featured</Badge>
          </div>
        )}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16"
            onClick={() => toggleSaveJob(job.id)}
          >
            {savedJobs.includes(job.id) ? (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
            <span className="sr-only">
              {savedJobs.includes(job.id) ? 'Unsave' : 'Save'} job
            </span>
          </Button>
        )}
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <Link href={`/jobs/${job.id}`}>
                <CardTitle className="text-xl hover:text-primary transition-colors">{job.title}</CardTitle>
              </Link>
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
          <Link href={`/jobs/${job.id}`}>
            <Button>Apply Now</Button>
          </Link>
        </CardFooter>
      </Card>
  );

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
          <div className="flex gap-2 mt-4 md:mt-0">
            {isAuthenticated && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" /> Saved Searches
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h3 className="font-medium">Your Saved Searches</h3>
                    {savedSearches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No saved searches yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {savedSearches.map(search => (
                          <div 
                            key={search.id}
                            className="p-2 border rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => loadSavedSearch(search)}
                          >
                            <div className="font-medium">{search.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {search.filters.searchTerm && `Keyword: ${search.filters.searchTerm}`}
                              {search.filters.location && ` • Location: ${search.filters.location}`}
                              {search.filters.jobType && ` • Type: ${search.filters.jobType}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={saveCurrentSearch}
                      disabled={activeFilters.length === 0}
                    >
                      Save Current Search
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Button 
              variant={showAdvancedFilters ? 'default' : 'outline'} 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Sliders className="mr-2 h-4 w-4" /> 
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </Button>
          </div>
        </div>

        {/* Basic Search Bar */}
        <div className="bg-card rounded-lg p-4 shadow-sm border mb-4">
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
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger className="flex-1">
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
              <Button onClick={applyFiltersAndSearch}>Search</Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="bg-card rounded-lg p-4 shadow-sm border mb-4 animate-in fade-in-50 duration-300">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="salary">
                <AccordionTrigger>Salary Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-sm">
                      <span>${salaryRange[0].toLocaleString()}</span>
                      <span>${salaryRange[1].toLocaleString()}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 100000]}
                      min={0}
                      max={100000}
                      step={5000}
                      value={salaryRange}
                      onValueChange={(value) => setSalaryRange(value as [number, number])}
                      className="mb-6"
                    />
                    <div className="text-xs text-muted-foreground">
                      Note: Hourly wages are converted to yearly salary for comparison (based on 40 hours/week)
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="cuisine">
                <AccordionTrigger>Cuisine Type</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                    {allCuisineTypes.map(cuisine => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cuisine-${cuisine}`} 
                          checked={cuisineTypes.includes(cuisine)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCuisineTypes([...cuisineTypes, cuisine]);
                            } else {
                              setCuisineTypes(cuisineTypes.filter(c => c !== cuisine));
                            }
                          }}
                        />
                        <Label htmlFor={`cuisine-${cuisine}`}>{cuisine}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="date">
                <AccordionTrigger>Date Posted</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="date-any" 
                        checked={!datePosted}
                        onCheckedChange={() => setDatePosted(undefined)}
                      />
                      <Label htmlFor="date-any">Any time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="date-today" 
                        checked={datePosted === 'today'}
                        onCheckedChange={(checked) => {
                          if (checked) setDatePosted('today');
                        }}
                      />
                      <Label htmlFor="date-today">Today</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="date-week" 
                        checked={datePosted === 'week'}
                        onCheckedChange={(checked) => {
                          if (checked) setDatePosted('week');
                        }}
                      />
                      <Label htmlFor="date-week">Past week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="date-month" 
                        checked={datePosted === 'month'}
                        onCheckedChange={(checked) => {
                          if (checked) setDatePosted('month');
                        }}
                      />
                      <Label htmlFor="date-month">Past month</Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <Button onClick={applyFiltersAndSearch}>Apply Filters</Button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {filter}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Job Listings */}
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="full-time">Full-time</TabsTrigger>
            <TabsTrigger value="part-time">Part-time</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
            {isAuthenticated && (
              <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="all">
            {showNoResults ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-medium mb-2">No job listings found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or check back later for new opportunities.
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredJobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="full-time">
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs
                .filter(job => job.jobType === "Full-time")
                .map(renderJobCard)}
            </div>
          </TabsContent>
          
          {/* Similar content for other tabs */}
          <TabsContent value="part-time">
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs
                .filter(job => job.jobType === "Part-time")
                .map(renderJobCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="event">
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs
                .filter(job => job.jobType === "Event")
                .map(renderJobCard)}
            </div>
          </TabsContent>
          
          {isAuthenticated && (
            <TabsContent value="saved">
              {savedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-xl font-medium mb-2">No saved jobs</h3>
                  <p className="text-muted-foreground mb-6">
                    Save jobs you're interested in by clicking the star icon on job listings.
                  </p>
                  <Button onClick={() => {
                    const allTabElement = document.querySelector('[data-value=all]');
                    if (allTabElement instanceof HTMLElement) {
                      allTabElement.click();
                    }
                  }}>
                    Browse All Jobs
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {mockJobs
                    .filter(job => savedJobs.includes(job.id))
                    .map(renderJobCard)}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}