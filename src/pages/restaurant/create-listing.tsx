
import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { JobListing, Availability } from "@/types";

const jobListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string(),
  }),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  type: z.string(),
  cuisineTypes: z.array(z.string()),
  availability: z.array(z.object({
    dayOfWeek: z.string(),
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })),
});

export default function CreateListingPage() {
  const { user } = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      salary: {
        min: 0,
        max: 0,
        currency: "USD",
      },
      requirements: [],
      responsibilities: [],
      type: "full-time",
      cuisineTypes: [],
      availability: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof jobListingSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job listing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { cuisineTypes, requirements, availabilities } = data;
      
      const jobListing: Partial<JobListing> = {
        ...data,
        cuisineTypes, // Now matches the updated interface
        requirements,
        availability: availabilities as Availability[],
      };

      // Add your job listing creation logic here

      toast({
        title: "Success",
        description: "Job listing created successfully",
      });
      router.push("/restaurant/listings");
    } catch (error) {
      console.error("Error creating job listing:", error);
      toast({
        title: "Error",
        description: "Failed to create job listing",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Job Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form fields implementation */}
              <Button type="submit" disabled={isSubmitting}>
                Create Listing
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
