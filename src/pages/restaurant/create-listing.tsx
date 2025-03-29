
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  MapPin, 
  DollarSign,
  Plus,
  Trash2,
  Star,
  Info
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { JobListing, Availability } from "@/types";

// Form schema
const jobListingSchema = z.object({
  title: z.string().min(2, { message: "Job title is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  jobType: z.enum(["Full-time", "Part-time", "Temporary", "Event", "Seasonal"]),
  salary: z.object({
    amount: z.number().min(1, { message: "Salary amount is required." }),
    period: z.enum(["Hourly", "Daily", "Weekly", "Monthly", "Yearly"])
  }).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  eventDate: z.date().optional(),
  applicationDeadline: z.date().optional(),
  isPremium: z.boolean().default(false),
});

export default function CreateListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [cuisineInput, setCuisineInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState("");
  const [availabilities, setAvailabilities] = useState<Partial<Availability>[]>([]);
  const [currentAvailability, setCurrentAvailability] = useState<Partial<Availability>>({});
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof jobListingSchema>>({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      jobType: "Full-time",
      isPremium: false,
    },
  });

  const handleAddCuisine = () => {
    if (cuisineInput.trim() && !cuisineTypes.includes(cuisineInput.trim())) {
      setCuisineTypes([...cuisineTypes, cuisineInput.trim()]);
      setCuisineInput("");
    }
  };

  const handleRemoveCuisine = (cuisine: string) => {
    setCuisineTypes(cuisineTypes.filter((c) => c !== cuisine));
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput("");
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setRequirements(requirements.filter((r) => r !== requirement));
  };

  const onSubmit = async (data: z.infer<typeof jobListingSchema>) => {
    setIsSubmitting(true);
    
    // Combine all data
    const jobListing: Partial<JobListing> = {
      ...data,
      cuisineType: cuisineTypes,
      requirements,
      requiredAvailability: availabilities as Availability[],
    };
    
    // In a real app, this would save to Firebase
    console.log("Job listing data:", jobListing);
    
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/restaurant/dashboard");
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>Create Job Listing | StaffSpace</title>
        <meta name="description" content="Create a new job listing to find the perfect staff for your restaurant." />
      </Head>

      <div className="container max-w-3xl py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Job Listing</h1>
          <p className="text-muted-foreground mt-2">Post a new job to find the perfect staff for your restaurant</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Enter the details of the position you're looking to fill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Head Chef, Server, Bartender" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Cuisine Type</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cuisineTypes.map((cuisine, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {cuisine}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => handleRemoveCuisine(cuisine)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., Italian, French, Casual Dining"
                      value={cuisineInput}
                      onChange={(e) => setCuisineInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCuisine();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddCuisine}>Add</Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the role, responsibilities, and what you're looking for in a candidate"
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Requirements</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {requirements.map((requirement, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {requirement}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-4 w-4 p-0 ml-1" 
                          onClick={() => handleRemoveRequirement(requirement)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g., 2+ years experience, Food Handler's Certificate"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRequirement();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddRequirement}>Add</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New York, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Temporary">Temporary</SelectItem>
                            <SelectItem value="Event">Event</SelectItem>
                            <SelectItem value="Seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Salary Amount</FormLabel>
                    <Input 
                      type="number" 
                      placeholder="e.g., 15, 50000"
                      value={form.watch("salary")?.amount || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          form.setValue("salary", {
                            ...form.watch("salary") || { period: "Hourly" },
                            amount: value
                          });
                        } else {
                          form.setValue("salary", undefined);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <FormLabel>Salary Period</FormLabel>
                    <Select 
                      value={form.watch("salary")?.period || "Hourly"}
                      onValueChange={(value) => {
                        form.setValue("salary", {
                          ...form.watch("salary") || { amount: 0 },
                          period: value as "Hourly" | "Daily" | "Weekly" | "Monthly" | "Yearly"
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hourly">Per Hour</SelectItem>
                        <SelectItem value="Daily">Per Day</SelectItem>
                        <SelectItem value="Weekly">Per Week</SelectItem>
                        <SelectItem value="Monthly">Per Month</SelectItem>
                        <SelectItem value="Yearly">Per Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Application Deadline (Optional)</FormLabel>
                    <Input 
                      type="date"
                      value={form.watch("applicationDeadline") ? new Date(form.watch("applicationDeadline")).toISOString().split('T')[0] : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          form.setValue("applicationDeadline", new Date(e.target.value));
                        } else {
                          form.setValue("applicationDeadline", undefined);
                        }
                      }}
                    />
                  </div>

                  {form.watch("jobType") === "Event" && (
                    <div>
                      <FormLabel>Event Date</FormLabel>
                      <Input 
                        type="date"
                        value={form.watch("eventDate") ? new Date(form.watch("eventDate")).toISOString().split('T')[0] : ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            form.setValue("eventDate", new Date(e.target.value));
                          } else {
                            form.setValue("eventDate", undefined);
                          }
                        }}
                      />
                    </div>
                  )}

                  {(form.watch("jobType") === "Temporary" || form.watch("jobType") === "Seasonal") && (
                    <>
                      <div>
                        <FormLabel>Start Date</FormLabel>
                        <Input 
                          type="date"
                          value={form.watch("startDate") ? new Date(form.watch("startDate")).toISOString().split('T')[0] : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              form.setValue("startDate", new Date(e.target.value));
                            } else {
                              form.setValue("startDate", undefined);
                            }
                          }}
                        />
                      </div>

                      <div>
                        <FormLabel>End Date</FormLabel>
                        <Input 
                          type="date"
                          value={form.watch("endDate") ? new Date(form.watch("endDate")).toISOString().split('T')[0] : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              form.setValue("endDate", new Date(e.target.value));
                            } else {
                              form.setValue("endDate", undefined);
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Required Availability</h3>
                  {availabilities.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      {availabilities.map((avail, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{avail.day}</h3>
                              <p className="text-sm text-muted-foreground">
                                {avail.startTime} - {avail.endTime}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setAvailabilities(availabilities.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 mb-4">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No availability requirements added</h3>
                      <p className="mt-2 text-muted-foreground">
                        Add specific days and times when you need staff to be available.
                      </p>
                    </div>
                  )}

                  {isAddingAvailability ? (
                    <div className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-medium">Add Availability</h3>
                      <div className="space-y-4">
                        <div>
                          <FormLabel>Day</FormLabel>
                          <Select 
                            value={currentAvailability.day} 
                            onValueChange={(value) => setCurrentAvailability({
                              ...currentAvailability, 
                              day: value as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Monday">Monday</SelectItem>
                              <SelectItem value="Tuesday">Tuesday</SelectItem>
                              <SelectItem value="Wednesday">Wednesday</SelectItem>
                              <SelectItem value="Thursday">Thursday</SelectItem>
                              <SelectItem value="Friday">Friday</SelectItem>
                              <SelectItem value="Saturday">Saturday</SelectItem>
                              <SelectItem value="Sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel>Start Time</FormLabel>
                            <Input 
                              type="time"
                              value={currentAvailability.startTime || ""}
                              onChange={(e) => setCurrentAvailability({
                                ...currentAvailability, 
                                startTime: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <FormLabel>End Time</FormLabel>
                            <Input 
                              type="time"
                              value={currentAvailability.endTime || ""}
                              onChange={(e) => setCurrentAvailability({
                                ...currentAvailability, 
                                endTime: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => {
                              setIsAddingAvailability(false);
                              setCurrentAvailability({});
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => {
                              if (currentAvailability.day && 
                                  currentAvailability.startTime && 
                                  currentAvailability.endTime) {
                                setAvailabilities([...availabilities, currentAvailability as Availability]);
                                setCurrentAvailability({});
                                setIsAddingAvailability(false);
                              }
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setIsAddingAvailability(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Availability
                    </Button>
                  )}
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">Premium Listing</h4>
                        <Badge variant="default" className="bg-primary">Featured</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Premium listings appear at the top of search results and get more visibility.
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="premium-listing"
                          checked={form.watch("isPremium") || false}
                          onCheckedChange={(checked) => {
                            form.setValue("isPremium", checked as boolean);
                          }}
                        />
                        <label 
                          htmlFor="premium-listing"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Make this a premium listing ($29.99)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Listing"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
